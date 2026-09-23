// Derived from pi-tool-display 0.5.0 by MasuRii (MIT). See ./LICENSE.
import { Text, truncateToWidth, visibleWidth, wrapTextWithAnsi, type Component } from "@earendil-works/pi-tui";
import { getLanguageFromPath, highlightCode, type EditToolDetails } from "@earendil-works/pi-coding-agent";
import { ANSI_SGR_PATTERN, filterSgrSequences, toSgrParams, readSgrColorSequence, expandSgrReset } from "./ansi";
import {
	buildCollapsedDiffHintText,
	clampRenderedLineToWidth,
	clampRenderedLinesToWidth,
} from "./line-width-safety";
import {
	buildDiffSummaryText,
	normalizeDiffRenderWidth,
	resolveDiffPresentationMode,
	type DiffPresentationMode,
} from "./diff-presentation";
import { pluralize, sanitizeAnsiForThemedOutput } from "./formatting";
import { FILE_DIFF_CONFIG, type DiffIndicatorMode, type FileDiffConfig } from "./types";

interface DiffTheme {
	fg(color: string, text: string): string;
	bg?(color: string, text: string): string;
	bold?(text: string): string;
	getFgAnsi?(color: string): string;
	getBgAnsi?(color: string): string;
}

type DiffLineKind = "add" | "remove" | "context";
type DiffEntryKind = "line" | "meta" | "hunk" | "file";

interface DiffLineEntry {
	kind: "line";
	lineKind: DiffLineKind;
	oldLineNumber: number | null;
	newLineNumber: number | null;
	fallbackLineNumber: string;
	content: string;
	hashlineAnchorContent?: string;
	raw: string;
	hunkIndex: number;
}

interface DiffMetaEntry {
	kind: Exclude<DiffEntryKind, "line">;
	raw: string;
	hunkIndex: number;
}

type ParsedDiffEntry = DiffLineEntry | DiffMetaEntry;

interface ParsedDiff {
	entries: ParsedDiffEntry[];
	stats: DiffStats;
}

interface DiffStats {
	added: number;
	removed: number;
	context: number;
	hunks: number;
	files: number;
	lines: number;
}

interface RenderedRow {
	text: string;
	hunkIndex: number | null;
}

interface SplitDiffRow {
	left?: DiffLineEntry;
	right?: DiffLineEntry;
	meta?: DiffMetaEntry;
	hunkIndex: number | null;
}

interface DiffSpan {
	start: number;
	end: number;
}

interface RgbColor {
	r: number;
	g: number;
	b: number;
}

interface DiffPalette {
	addRowBgAnsi: string;
	removeRowBgAnsi: string;
	addEmphasisBgAnsi: string;
	removeEmphasisBgAnsi: string;
}

interface DiffRenderOptions {
	expanded: boolean;
	filePath?: string;
	headerLabel?: string;
	hideHunkHeaders?: boolean;
}

type CodeLineHighlighter = (line: string) => string;

const CANONICAL_LINE_PATTERN = /^([+\- ])(\s*\d+)\|(.*)$/;
const HASHLINE_ANCHOR_LINE_PATTERN = /^([+\- ])(\s*\d+)#([A-Za-z0-9]+| {2}):(.*)$/;
const LEGACY_LINE_PATTERN = /^([+\- ])(\s*\d+)\s(.*)$/;
const HUNK_HEADER_PATTERN = /^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@(.*)$/;
const MIN_LINE_NUMBER_WIDTH = 2;
const MAX_INLINE_DIFF_LINE_LENGTH = 700;
const ADD_ROW_BACKGROUND_MIX_RATIO = 0.12;
const REMOVE_ROW_BACKGROUND_MIX_RATIO = 0.12;
const ADD_INLINE_EMPHASIS_MIX_RATIO = 0.26;
const REMOVE_INLINE_EMPHASIS_MIX_RATIO = 0.26;
const ADDITION_TINT_TARGET: RgbColor = { r: 84, g: 190, b: 118 };
const DELETION_TINT_TARGET: RgbColor = { r: 232, g: 95, b: 122 };
const ANSI_BG_RESET = "\x1b[49m";
const DIFF_WIDTH_OPS = {
	measure: visibleWidth,
	truncate: (text: string, maxWidth: number): string => truncateToWidth(text, maxWidth, ""),
};

function clampDiffLineToWidth(text: string, width: number): string {
	return stabilizeBackgroundResets(clampRenderedLineToWidth(text, width, DIFF_WIDTH_OPS));
}

function clampDiffLinesToWidth(lines: string[], width: number): string[] {
	return clampRenderedLinesToWidth(lines, width, DIFF_WIDTH_OPS).map((line) => stabilizeBackgroundResets(line));
}

function normalizeCodeWhitespace(text: string): string {
	return text.replace(/\t/g, "    ");
}

function emphasis(theme: DiffTheme, text: string): string {
	return typeof theme.bold === "function" ? theme.bold(text) : text;
}



function sequenceResetsBackground(params: number[]): boolean {
	let index = 0;
	while (index < params.length) {
		const param = params[index] ?? 0;
		if (param === 0 || param === 49) {
			return true;
		}

		const colorSequence = readSgrColorSequence(params, index);
		index += colorSequence ? colorSequence.length : 1;
	}

	return false;
}

function stripBackgroundResetParams(params: number[]): number[] {
	const filtered: number[] = [];

	for (let i = 0; i < params.length; i++) {
		const param = params[i] ?? 0;

		if (param === 0) {
			filtered.push(...expandSgrReset(param)!);
			continue;
		}

		if (param === 49) {
			continue;
		}

		const colorSequence = readSgrColorSequence(params, i);
		if (colorSequence) {
			filtered.push(...colorSequence);
			i += colorSequence.length - 1;
			continue;
		}

		filtered.push(param);
	}

	return filtered;
}

function stabilizeBackgroundResets(text: string): string {
	if (!text) {
		return text;
	}
	return filterSgrSequences(text, stripBackgroundResetParams);
}

function fitToWidth(text: string, width: number): string {
	const trimmed = truncateToWidth(text, width, "");
	const gap = Math.max(0, width - visibleWidth(trimmed));
	return gap > 0 ? `${trimmed}${" ".repeat(gap)}` : trimmed;
}

function applyBackgroundToVisualRow(
	text: string,
	width: number,
	rowBgAnsi: string,
	restoreBgAnsi: string,
): string {
	if (width <= 0) {
		return "";
	}

	const fitted = fitToWidth(text, width);
	const withStableBackground = keepBackgroundAcrossResets(fitted, rowBgAnsi);
	return stabilizeBackgroundResets(`${rowBgAnsi}${withStableBackground}${restoreBgAnsi}`);
}

function applyLineBackgroundToWrappedRows(
	rows: string[],
	width: number,
	rowBgAnsi: string,
	restoreBgAnsi: string,
): string[] {
	if (rows.length === 0) {
		return [applyBackgroundToVisualRow("", width, rowBgAnsi, restoreBgAnsi)];
	}

	return rows.map((row) => applyBackgroundToVisualRow(row, width, rowBgAnsi, restoreBgAnsi));
}

function wrapToWidth(text: string, width: number, wordWrap: boolean): string[] {
	if (width <= 0) {
		return [""];
	}

	if (!wordWrap) {
		return [fitToWidth(text, width)];
	}

	const wrapped = wrapTextWithAnsi(text, width);
	if (wrapped.length === 0) {
		return [fitToWidth("", width)];
	}

	return wrapped.map((line) => fitToWidth(line, width));
}

function resolveLanguageFromPath(rawPath: string | undefined): string | undefined {
	if (!rawPath || !rawPath.trim()) {
		return undefined;
	}
	const normalizedPath = rawPath.replace(/^@/, "").trim();
	if (!normalizedPath) {
		return undefined;
	}
	try {
		return getLanguageFromPath(normalizedPath);
	} catch {
		return undefined;
	}
}

function createCodeLineHighlighter(language: string | undefined): CodeLineHighlighter {
	if (!language) {
		return (line) => sanitizeAnsiForThemedOutput(line);
	}

	const cache = new Map<string, string>();
	return (line) => {
		if (!line) {
			return line;
		}
		const cached = cache.get(line);
		if (cached !== undefined) {
			return cached;
		}
		try {
			const highlighted = highlightCode(line, language)[0] ?? line;
			const sanitized = sanitizeAnsiForThemedOutput(highlighted);
			cache.set(line, sanitized);
			return sanitized;
		} catch {
			const sanitizedFallback = sanitizeAnsiForThemedOutput(line);
			cache.set(line, sanitizedFallback);
			return sanitizedFallback;
		}
	};
}

function toParsedDiffLine(
	prefix: string,
	lineNumber: string,
	content: string,
): {
	lineKind: DiffLineKind;
	lineNumber: string;
	content: string;
} {
	const normalizedLineNumber = lineNumber.trim();
	if (prefix === "+") {
		return { lineKind: "add", lineNumber: normalizedLineNumber, content };
	}
	if (prefix === "-") {
		return { lineKind: "remove", lineNumber: normalizedLineNumber, content };
	}
	return { lineKind: "context", lineNumber: normalizedLineNumber, content };
}

function parseCanonicalDiffLine(line: string): {
	lineKind: DiffLineKind;
	lineNumber: string;
	content: string;
	hashlineAnchorContent?: string;
} | null {
	const hashlineAnchorMatch = line.match(HASHLINE_ANCHOR_LINE_PATTERN);
	if (hashlineAnchorMatch) {
		const lineNumber = hashlineAnchorMatch[2] ?? "";
		const hash = hashlineAnchorMatch[3] ?? "";
		const content = hashlineAnchorMatch[4] ?? "";
		const parsed = toParsedDiffLine(
			hashlineAnchorMatch[1] ?? " ",
			lineNumber,
			content,
		);
		return {
			...parsed,
			hashlineAnchorContent: `${lineNumber.trim()}#${hash}:${content}`,
		};
	}

	const canonicalMatch = line.match(CANONICAL_LINE_PATTERN);
	const legacyMatch = canonicalMatch ? null : line.match(LEGACY_LINE_PATTERN);
	const matched = canonicalMatch ?? legacyMatch;
	if (!matched) {
		return null;
	}

	return toParsedDiffLine(
		matched[1] ?? " ",
		matched[2] ?? "",
		matched[3] ?? "",
	);
}

function toNumber(value: string | undefined): number | null {
	if (!value) {
		return null;
	}
	const parsed = Number.parseInt(value, 10);
	return Number.isNaN(parsed) ? null : parsed;
}

function anchorCanonicalLineCursors(
	kind: DiffLineKind,
	parsedNumber: number | null,
	oldLineCursor: number | null,
	newLineCursor: number | null,
	lineNumberDelta: number,
): { oldLineCursor: number | null; newLineCursor: number | null } {
	if (parsedNumber === null) {
		return { oldLineCursor, newLineCursor };
	}

	if (kind === "add") {
		return {
			oldLineCursor,
			newLineCursor: newLineCursor ?? parsedNumber,
		};
	}

	return {
		oldLineCursor: parsedNumber,
		newLineCursor: parsedNumber + lineNumberDelta,
	};
}

function classifyMetaLine(raw: string): DiffMetaEntry["kind"] {
	if (raw.startsWith("@@")) {
		return "hunk";
	}
	if (
		raw.startsWith("diff --git")
		|| raw.startsWith("index ")
		|| raw.startsWith("--- ")
		|| raw.startsWith("+++ ")
		|| raw.startsWith("rename from ")
		|| raw.startsWith("rename to ")
		|| raw.startsWith("new file mode ")
		|| raw.startsWith("deleted file mode ")
	) {
		return "file";
	}
	return "meta";
}

function pushParsedLineEntry(
	entries: ParsedDiffEntry[],
	lineKind: DiffLineKind,
	oldLineNumber: number | null,
	newLineNumber: number | null,
	fallbackLineNumber: string,
	rawLine: string,
	hunkIndex: number,
): void {
	entries.push({
		kind: "line",
		lineKind,
		oldLineNumber,
		newLineNumber,
		fallbackLineNumber,
		content: rawLine.slice(1),
		raw: rawLine,
		hunkIndex,
	});
}

function createMetaEntry(raw: string, hunkIndex: number): DiffMetaEntry {
	return {
		kind: classifyMetaLine(raw),
		raw,
		hunkIndex,
	};
}

function ensureImplicitHunk(currentHunk: number): number {
	return currentHunk > 0 ? currentHunk : 1;
}

function parseDiff(diffText: string): ParsedDiff {
	const stats: DiffStats = {
		added: 0,
		removed: 0,
		context: 0,
		hunks: 0,
		files: 0,
		lines: 0,
	};
	const entries: ParsedDiffEntry[] = [];

	if (!diffText.trim()) {
		return { entries, stats };
	}

	let hunkIndex = 0;
	let oldLineCursor: number | null = null;
	let newLineCursor: number | null = null;
	let lineNumberDelta = 0;

	for (const rawLine of diffText.replace(/\r/g, "").split("\n")) {
		stats.lines++;

		const hunkMatch = rawLine.match(HUNK_HEADER_PATTERN);
		if (hunkMatch) {
			hunkIndex++;
			stats.hunks = Math.max(stats.hunks, hunkIndex);
			oldLineCursor = toNumber(hunkMatch[1]);
			newLineCursor = toNumber(hunkMatch[3]);
			lineNumberDelta = (newLineCursor ?? 0) - (oldLineCursor ?? 0);
			entries.push({ kind: "hunk", raw: rawLine, hunkIndex });
			continue;
		}

		if (rawLine.startsWith("diff --git ")) {
			stats.files++;
			oldLineCursor = null;
			newLineCursor = null;
			lineNumberDelta = 0;
			entries.push({ kind: "file", raw: rawLine, hunkIndex });
			continue;
		}

		if (rawLine.startsWith("--- ") || rawLine.startsWith("+++ ")) {
			oldLineCursor = null;
			newLineCursor = null;
			lineNumberDelta = 0;
		}

		const canonical = parseCanonicalDiffLine(rawLine);
		if (canonical) {
			hunkIndex = ensureImplicitHunk(hunkIndex);
			stats.hunks = Math.max(stats.hunks, hunkIndex);

			const parsedNumber = toNumber(canonical.lineNumber);
			const anchoredCursors = anchorCanonicalLineCursors(
				canonical.lineKind,
				parsedNumber,
				oldLineCursor,
				newLineCursor,
				lineNumberDelta,
			);
			oldLineCursor = anchoredCursors.oldLineCursor;
			newLineCursor = anchoredCursors.newLineCursor;

			const oldLineNumber = canonical.lineKind === "add" ? null : oldLineCursor;
			const newLineNumber = canonical.lineKind === "remove" ? null : newLineCursor;

			if (canonical.lineKind === "add") {
				stats.added++;
				if (newLineCursor !== null) {
					newLineCursor++;
				}
				lineNumberDelta++;
			} else if (canonical.lineKind === "remove") {
				stats.removed++;
				if (oldLineCursor !== null) {
					oldLineCursor++;
				}
				lineNumberDelta--;
			} else {
				stats.context++;
				if (oldLineCursor !== null) {
					oldLineCursor++;
				}
				if (newLineCursor !== null) {
					newLineCursor++;
				}
			}

			entries.push({
				kind: "line",
				lineKind: canonical.lineKind,
				oldLineNumber,
				newLineNumber,
				fallbackLineNumber: canonical.lineNumber,
				content: canonical.content,
				hashlineAnchorContent: canonical.hashlineAnchorContent,
				raw: rawLine,
				hunkIndex,
			});
			continue;
		}

		if (rawLine.startsWith("-") && !rawLine.startsWith("---")) {
			hunkIndex = ensureImplicitHunk(hunkIndex);
			stats.hunks = Math.max(stats.hunks, hunkIndex);
			stats.removed++;
			const oldLineNumber = oldLineCursor;
			if (oldLineCursor !== null) {
				oldLineCursor++;
			}
			lineNumberDelta--;
			pushParsedLineEntry(
				entries,
				"remove",
				oldLineNumber,
				null,
				oldLineNumber !== null ? `${oldLineNumber}` : "",
				rawLine,
				hunkIndex,
			);
			continue;
		}

		if (rawLine.startsWith("+") && !rawLine.startsWith("+++")) {
			hunkIndex = ensureImplicitHunk(hunkIndex);
			stats.hunks = Math.max(stats.hunks, hunkIndex);
			stats.added++;
			const newLineNumber = newLineCursor;
			if (newLineCursor !== null) {
				newLineCursor++;
			}
			lineNumberDelta++;
			pushParsedLineEntry(
				entries,
				"add",
				null,
				newLineNumber,
				newLineNumber !== null ? `${newLineNumber}` : "",
				rawLine,
				hunkIndex,
			);
			continue;
		}

		if (rawLine.startsWith(" ")) {
			hunkIndex = ensureImplicitHunk(hunkIndex);
			stats.hunks = Math.max(stats.hunks, hunkIndex);
			stats.context++;
			const oldLineNumber = oldLineCursor;
			const newLineNumber = newLineCursor;
			if (oldLineCursor !== null) {
				oldLineCursor++;
			}
			if (newLineCursor !== null) {
				newLineCursor++;
			}
			pushParsedLineEntry(
				entries,
				"context",
				oldLineNumber,
				newLineNumber,
				oldLineNumber !== null ? `${oldLineNumber}` : newLineNumber !== null ? `${newLineNumber}` : "",
				rawLine,
				hunkIndex,
			);
			continue;
		}

		entries.push(createMetaEntry(rawLine, hunkIndex));
	}

	if (stats.hunks === 0 && (stats.added > 0 || stats.removed > 0 || stats.context > 0)) {
		stats.hunks = 1;
	}
	if (stats.files === 0) {
		const patchStyleFileHeaders = entries.filter(
			(entry) => entry.kind === "file" && entry.raw.startsWith("+++ "),
		).length;
		if (patchStyleFileHeaders > 0) {
			stats.files = patchStyleFileHeaders;
		} else if (stats.hunks > 0) {
			stats.files = 1;
		}
	}

	return { entries, stats };
}

function getHashlineAnchorLabel(entry: DiffLineEntry): string | undefined {
	if (!entry.hashlineAnchorContent) {
		return undefined;
	}
	const separatorIndex = entry.hashlineAnchorContent.indexOf(":");
	return separatorIndex >= 0
		? entry.hashlineAnchorContent.slice(0, separatorIndex)
		: entry.hashlineAnchorContent;
}

function getLineNumberWidth(entries: ParsedDiffEntry[], showHashlineAnchors = false): number {
	let maxWidth = MIN_LINE_NUMBER_WIDTH;

	for (const entry of entries) {
		if (entry.kind !== "line") {
			continue;
		}

		if (showHashlineAnchors) {
			const anchorLabel = getHashlineAnchorLabel(entry);
			if (anchorLabel) {
				maxWidth = Math.max(maxWidth, visibleWidth(anchorLabel));
				continue;
			}
		}

		const candidates = [
			entry.oldLineNumber,
			entry.newLineNumber,
			toNumber(entry.fallbackLineNumber),
		].filter((value): value is number => value !== null);

		for (const candidate of candidates) {
			const digits = `${candidate}`.length;
			if (digits > maxWidth) {
				maxWidth = digits;
			}
		}
	}

	return maxWidth;
}

function formatLineNumber(value: number | null, fallback: string, width: number): string {
	if (value !== null) {
		return `${value}`.padStart(width, " ");
	}
	if (fallback.trim()) {
		return fallback.trim().slice(-width).padStart(width, " ");
	}
	return " ".repeat(width);
}

function formatLineNumberLabel(
	entry: DiffLineEntry,
	value: number | null,
	fallback: string,
	width: number,
	showHashlineAnchors: boolean,
): string {
	const anchorLabel = showHashlineAnchors ? getHashlineAnchorLabel(entry) : undefined;
	if (anchorLabel) {
		return fitToWidth(anchorLabel, width);
	}
	return formatLineNumber(value, fallback, width);
}

function formatMetaEntryRows(entry: DiffMetaEntry, width: number, theme: DiffTheme, wordWrap: boolean): RenderedRow[] {
	const normalized = sanitizeAnsiForThemedOutput(normalizeCodeWhitespace(entry.raw));
	const lines = wordWrap
		? wrapToWidth(normalized, width, true)
		: [truncateToWidth(normalized, width)];

	const mapColor = (line: string): string => {
		if (entry.kind === "hunk") {
			return stabilizeBackgroundResets(theme.fg("accent", line));
		}
		if (entry.kind === "file") {
			return stabilizeBackgroundResets(theme.fg("muted", line));
		}
		return stabilizeBackgroundResets(theme.fg("toolDiffContext", line));
	};

	return lines.map((line) => ({
		text: mapColor(line),
		hunkIndex: entry.kind === "file" ? null : entry.hunkIndex || null,
	}));
}

function collectConsecutiveLineEntries(
	entries: ParsedDiffEntry[],
	startIndex: number,
	lineKind: DiffLineKind,
): { collected: DiffLineEntry[]; nextIndex: number } {
	const collected: DiffLineEntry[] = [];
	let index = startIndex;
	while (index < entries.length) {
		const candidate = entries[index];
		if (!candidate || candidate.kind !== "line" || candidate.lineKind !== lineKind) {
			break;
		}
		collected.push(candidate);
		index++;
	}
	return { collected, nextIndex: index };
}

function buildSplitRows(entries: ParsedDiffEntry[]): SplitDiffRow[] {
	const rows: SplitDiffRow[] = [];
	let index = 0;

	while (index < entries.length) {
		const entry = entries[index];
		if (!entry) {
			break;
		}

		if (entry.kind !== "line") {
			rows.push({ meta: entry, hunkIndex: entry.hunkIndex || null });
			index++;
			continue;
		}

		if (entry.lineKind === "remove") {
			const removedResult = collectConsecutiveLineEntries(entries, index, "remove");
			const removed = removedResult.collected;
			const addedResult = collectConsecutiveLineEntries(entries, removedResult.nextIndex, "add");
			const added = addedResult.collected;
			index = addedResult.nextIndex;

			const pairCount = Math.max(removed.length, added.length);
			for (let pairIndex = 0; pairIndex < pairCount; pairIndex++) {
				const left = removed[pairIndex];
				const right = added[pairIndex];
				rows.push({
					left,
					right,
					hunkIndex: left?.hunkIndex ?? right?.hunkIndex ?? null,
				});
			}
			continue;
		}

		if (entry.lineKind === "add") {
			rows.push({ right: entry, hunkIndex: entry.hunkIndex || null });
			index++;
			continue;
		}

		rows.push({ left: entry, right: entry, hunkIndex: entry.hunkIndex || null });
		index++;
	}

	return rows;
}

function tokenizeInlineDiff(input: string): Array<{ value: string; start: number; end: number }> {
	if (!input) {
		return [];
	}

	const tokens: Array<{ value: string; start: number; end: number }> = [];
	const pattern = /(\s+|[A-Za-z0-9_]+|[^A-Za-z0-9_\s])/g;
	let match: RegExpExecArray | null;

	while ((match = pattern.exec(input)) !== null) {
		const value = match[0] ?? "";
		if (!value) {
			continue;
		}
		tokens.push({
			value,
			start: match.index,
			end: match.index + value.length,
		});
	}

	if (tokens.length === 0 && input.length > 0) {
		tokens.push({ value: input, start: 0, end: input.length });
	}

	return tokens;
}

function mergeSpans(spans: DiffSpan[]): DiffSpan[] {
	if (spans.length <= 1) {
		return spans;
	}

	const sorted = [...spans].sort((a, b) => a.start - b.start);
	const merged: DiffSpan[] = [sorted[0]!];

	for (let index = 1; index < sorted.length; index++) {
		const current = sorted[index];
		const previous = merged[merged.length - 1];
		if (!current || !previous) {
			continue;
		}

		if (current.start <= previous.end) {
			previous.end = Math.max(previous.end, current.end);
			continue;
		}

		merged.push({ ...current });
	}

	return merged;
}

function tokensToDiffSpans(
	text: string,
	tokens: Array<{ value: string; start: number; end: number }>,
	changedIndexes: Set<number>,
): DiffSpan[] {
	if (tokens.length === 0 || changedIndexes.size === 0) {
		return [];
	}

	const spans: DiffSpan[] = [];
	let start: number | null = null;
	let end = -1;

	for (let index = 0; index < tokens.length; index++) {
		if (!changedIndexes.has(index)) {
			if (start !== null && end > start) {
				spans.push({ start, end });
				start = null;
				end = -1;
			}
			continue;
		}

		const token = tokens[index];
		if (!token) {
			continue;
		}

		if (start === null) {
			start = token.start;
			end = token.end;
		} else {
			end = token.end;
		}
	}

	if (start !== null && end > start) {
		spans.push({ start, end });
	}

	const trimmed: DiffSpan[] = [];
	for (const span of spans) {
		let spanStart = span.start;
		let spanEnd = span.end;

		while (spanStart < spanEnd && /\s/.test(text[spanStart] ?? "")) {
			spanStart++;
		}
		while (spanEnd > spanStart && /\s/.test(text[spanEnd - 1] ?? "")) {
			spanEnd--;
		}
		if (spanEnd > spanStart) {
			trimmed.push({ start: spanStart, end: spanEnd });
		}
	}

	return mergeSpans(trimmed);
}

function computeInlineDiffSpans(leftLine: string, rightLine: string): { left: DiffSpan[]; right: DiffSpan[] } {
	if (leftLine === rightLine) {
		return { left: [], right: [] };
	}
	if (leftLine.length > MAX_INLINE_DIFF_LINE_LENGTH || rightLine.length > MAX_INLINE_DIFF_LINE_LENGTH) {
		return { left: [], right: [] };
	}

	const leftTokens = tokenizeInlineDiff(leftLine);
	const rightTokens = tokenizeInlineDiff(rightLine);
	const leftCount = leftTokens.length;
	const rightCount = rightTokens.length;

	if (leftCount === 0 || rightCount === 0) {
		return {
			left: leftLine.trim().length > 0 ? [{ start: 0, end: leftLine.length }] : [],
			right: rightLine.trim().length > 0 ? [{ start: 0, end: rightLine.length }] : [],
		};
	}

	const table: number[][] = Array.from({ length: leftCount + 1 }, () => Array<number>(rightCount + 1).fill(0));

	for (let leftIndex = 1; leftIndex <= leftCount; leftIndex++) {
		const leftToken = leftTokens[leftIndex - 1];
		for (let rightIndex = 1; rightIndex <= rightCount; rightIndex++) {
			const rightToken = rightTokens[rightIndex - 1];
			if (leftToken?.value === rightToken?.value) {
				table[leftIndex]![rightIndex] = (table[leftIndex - 1]?.[rightIndex - 1] ?? 0) + 1;
			} else {
				const top = table[leftIndex - 1]?.[rightIndex] ?? 0;
				const side = table[leftIndex]?.[rightIndex - 1] ?? 0;
				table[leftIndex]![rightIndex] = Math.max(top, side);
			}
		}
	}

	const changedLeft = new Set<number>();
	const changedRight = new Set<number>();
	let leftCursor = leftCount;
	let rightCursor = rightCount;

	while (leftCursor > 0 && rightCursor > 0) {
		const leftToken = leftTokens[leftCursor - 1];
		const rightToken = rightTokens[rightCursor - 1];
		if (leftToken?.value === rightToken?.value) {
			leftCursor--;
			rightCursor--;
			continue;
		}

		const top = table[leftCursor - 1]?.[rightCursor] ?? 0;
		const side = table[leftCursor]?.[rightCursor - 1] ?? 0;
		if (top >= side) {
			changedLeft.add(leftCursor - 1);
			leftCursor--;
		} else {
			changedRight.add(rightCursor - 1);
			rightCursor--;
		}
	}

	while (leftCursor > 0) {
		changedLeft.add(leftCursor - 1);
		leftCursor--;
	}
	while (rightCursor > 0) {
		changedRight.add(rightCursor - 1);
		rightCursor--;
	}

	return {
		left: tokensToDiffSpans(leftLine, leftTokens, changedLeft),
		right: tokensToDiffSpans(rightLine, rightTokens, changedRight),
	};
}

function getCompactLineRenderContent(entry: DiffLineEntry, showHashlineAnchors: boolean): string {
	return showHashlineAnchors && entry.hashlineAnchorContent
		? entry.hashlineAnchorContent
		: entry.content;
}

function buildInlineHighlightMap(rows: SplitDiffRow[]): WeakMap<DiffLineEntry, DiffSpan[]> {
	const highlights = new WeakMap<DiffLineEntry, DiffSpan[]>();

	for (const row of rows) {
		if (!row.left || !row.right) {
			continue;
		}
		if (row.left.lineKind !== "remove" || row.right.lineKind !== "add") {
			continue;
		}

		const leftText = normalizeCodeWhitespace(row.left.content);
		const rightText = normalizeCodeWhitespace(row.right.content);
		const inline = computeInlineDiffSpans(leftText, rightText);
		if (inline.left.length > 0) {
			highlights.set(row.left, inline.left);
		}
		if (inline.right.length > 0) {
			highlights.set(row.right, inline.right);
		}
	}

	return highlights;
}

function ansi256ToRgb(code: number): RgbColor {
	if (code < 0) {
		return { r: 0, g: 0, b: 0 };
	}
	if (code <= 15) {
		const base16: RgbColor[] = [
			{ r: 0, g: 0, b: 0 },
			{ r: 128, g: 0, b: 0 },
			{ r: 0, g: 128, b: 0 },
			{ r: 128, g: 128, b: 0 },
			{ r: 0, g: 0, b: 128 },
			{ r: 128, g: 0, b: 128 },
			{ r: 0, g: 128, b: 128 },
			{ r: 192, g: 192, b: 192 },
			{ r: 128, g: 128, b: 128 },
			{ r: 255, g: 0, b: 0 },
			{ r: 0, g: 255, b: 0 },
			{ r: 255, g: 255, b: 0 },
			{ r: 0, g: 0, b: 255 },
			{ r: 255, g: 0, b: 255 },
			{ r: 0, g: 255, b: 255 },
			{ r: 255, g: 255, b: 255 },
		];
		return base16[code] ?? { r: 255, g: 255, b: 255 };
	}
	if (code >= 232) {
		const value = Math.max(0, Math.min(255, 8 + (code - 232) * 10));
		return { r: value, g: value, b: value };
	}

	const cube = code - 16;
	const levels = [0, 95, 135, 175, 215, 255];
	const blue = cube % 6;
	const green = Math.floor(cube / 6) % 6;
	const red = Math.floor(cube / 36) % 6;
	return {
		r: levels[red] ?? 0,
		g: levels[green] ?? 0,
		b: levels[blue] ?? 0,
	};
}

function parseAnsiColorCode(ansi: string | undefined): RgbColor | null {
	if (!ansi) {
		return null;
	}
	const rgbMatch = /\x1b\[(?:3|4)8;2;(\d{1,3});(\d{1,3});(\d{1,3})m/.exec(ansi);
	if (rgbMatch) {
		const r = Number.parseInt(rgbMatch[1] ?? "0", 10);
		const g = Number.parseInt(rgbMatch[2] ?? "0", 10);
		const b = Number.parseInt(rgbMatch[3] ?? "0", 10);
		if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
			return {
				r: Math.max(0, Math.min(255, r)),
				g: Math.max(0, Math.min(255, g)),
				b: Math.max(0, Math.min(255, b)),
			};
		}
	}

	const bitMatch = /\x1b\[(?:3|4)8;5;(\d{1,3})m/.exec(ansi);
	if (bitMatch) {
		const code = Number.parseInt(bitMatch[1] ?? "0", 10);
		if (Number.isFinite(code)) {
			return ansi256ToRgb(code);
		}
	}

	return null;
}

function rgbToBgAnsi(color: RgbColor): string {
	const r = Math.max(0, Math.min(255, Math.round(color.r)));
	const g = Math.max(0, Math.min(255, Math.round(color.g)));
	const b = Math.max(0, Math.min(255, Math.round(color.b)));
	return `\x1b[48;2;${r};${g};${b}m`;
}

function mixRgb(base: RgbColor, tint: RgbColor, ratio: number): RgbColor {
	const clamped = Math.max(0, Math.min(1, ratio));
	return {
		r: base.r * (1 - clamped) + tint.r * clamped,
		g: base.g * (1 - clamped) + tint.g * clamped,
		b: base.b * (1 - clamped) + tint.b * clamped,
	};
}

function extractThemeBackgroundAnsi(text: string): string | undefined {
	if (!text || !text.includes("\x1b[")) {
		return undefined;
	}

	ANSI_SGR_PATTERN.lastIndex = 0;
	let match: RegExpExecArray | null;
	while ((match = ANSI_SGR_PATTERN.exec(text)) !== null) {
		const parsed = toSgrParams(match[1] ?? "");
		for (let index = 0; index < parsed.length; index += 1) {
			const param = parsed[index] ?? 0;
			if ((param >= 40 && param <= 47) || (param >= 100 && param <= 107)) {
				return `\x1b[${param}m`;
			}

			const colorSequence = readSgrColorSequence(parsed, index);
			if (colorSequence?.[0] === 48) {
				return `\x1b[${colorSequence.join(";")}m`;
			}
			if (colorSequence) {
				index += colorSequence.length - 1;
			}
		}
	}

	return undefined;
}

function readThemeAnsi(theme: DiffTheme, kind: "fg" | "bg", slot: string): string | undefined {
	try {
		if (kind === "fg" && typeof theme.getFgAnsi === "function") {
			return theme.getFgAnsi(slot);
		}
		if (kind === "bg") {
			if (typeof theme.getBgAnsi === "function") {
				return theme.getBgAnsi(slot);
			}
			if (typeof theme.bg === "function") {
				return extractThemeBackgroundAnsi(theme.bg(slot, " "));
			}
		}
	} catch {
		return undefined;
	}
	return undefined;
}

function resolveContainerBackgroundAnsi(theme: DiffTheme): string | undefined {
	return readThemeAnsi(theme, "bg", "toolSuccessBg")
		?? readThemeAnsi(theme, "bg", "toolPendingBg")
		?? readThemeAnsi(theme, "bg", "toolErrorBg")
		?? readThemeAnsi(theme, "bg", "userMessageBg");
}

function resolveDiffPalette(theme: DiffTheme): DiffPalette {
	const baseBg = parseAnsiColorCode(readThemeAnsi(theme, "bg", "toolSuccessBg"))
		?? parseAnsiColorCode(readThemeAnsi(theme, "bg", "toolPendingBg"))
		?? parseAnsiColorCode(readThemeAnsi(theme, "bg", "userMessageBg"))
		?? { r: 32, g: 35, b: 42 };
	const addFg = parseAnsiColorCode(readThemeAnsi(theme, "fg", "toolDiffAdded")) ?? { r: 88, g: 173, b: 88 };
	const removeFg = parseAnsiColorCode(readThemeAnsi(theme, "fg", "toolDiffRemoved")) ?? { r: 196, g: 98, b: 98 };
	const addTint = mixRgb(addFg, ADDITION_TINT_TARGET, 0.35);
	const removeTint = mixRgb(removeFg, DELETION_TINT_TARGET, 0.65);

	const addRowBg = mixRgb(baseBg, addTint, ADD_ROW_BACKGROUND_MIX_RATIO);
	const removeRowBg = mixRgb(baseBg, removeTint, REMOVE_ROW_BACKGROUND_MIX_RATIO);
	const addEmphasisBg = mixRgb(baseBg, addTint, ADD_INLINE_EMPHASIS_MIX_RATIO);
	const removeEmphasisBg = mixRgb(baseBg, removeTint, REMOVE_INLINE_EMPHASIS_MIX_RATIO);

	return {
		addRowBgAnsi: rgbToBgAnsi(addRowBg),
		removeRowBgAnsi: rgbToBgAnsi(removeRowBg),
		addEmphasisBgAnsi: rgbToBgAnsi(addEmphasisBg),
		removeEmphasisBgAnsi: rgbToBgAnsi(removeEmphasisBg),
	};
}

function getLineBackground(kind: DiffLineKind, palette: DiffPalette, emphasis: boolean): string | undefined {
	if (kind === "add") {
		return emphasis ? palette.addEmphasisBgAnsi : palette.addRowBgAnsi;
	}
	if (kind === "remove") {
		return emphasis ? palette.removeEmphasisBgAnsi : palette.removeRowBgAnsi;
	}
	return undefined;
}

function applyBackgroundToVisibleRange(
	ansiText: string,
	start: number,
	end: number,
	backgroundAnsi: string,
	restoreBackgroundAnsi: string,
): string {
	if (!ansiText || start >= end || end <= 0) {
		return ansiText;
	}

	const rangeStart = Math.max(0, start);
	const rangeEnd = Math.max(rangeStart, end);
	let output = "";
	let visibleIndex = 0;
	let index = 0;
	let inRange = false;

	while (index < ansiText.length) {
		if (ansiText[index] === "\x1b") {
			const sequenceEnd = ansiText.indexOf("m", index);
			if (sequenceEnd !== -1) {
				output += ansiText.slice(index, sequenceEnd + 1);
				index = sequenceEnd + 1;
				continue;
			}
		}

		if (visibleIndex === rangeStart && !inRange) {
			output += backgroundAnsi;
			inRange = true;
		}
		if (visibleIndex === rangeEnd && inRange) {
			output += restoreBackgroundAnsi;
			inRange = false;
		}

		output += ansiText[index] ?? "";
		visibleIndex++;
		index++;
	}

	if (inRange) {
		output += restoreBackgroundAnsi;
	}

	return output;
}

function applyInlineSpanHighlight(
	plainText: string,
	renderedText: string,
	spans: DiffSpan[],
	emphasisBgAnsi: string | undefined,
	rowBgAnsi: string | undefined,
	fallbackBgAnsi: string | undefined,
): string {
	if (!renderedText || !plainText || spans.length === 0 || !emphasisBgAnsi) {
		return renderedText;
	}

	const sorted = mergeSpans(
		spans
			.map((span) => ({
				start: Math.max(0, Math.min(plainText.length, span.start)),
				end: Math.max(0, Math.min(plainText.length, span.end)),
			}))
			.filter((span) => span.end > span.start),
	);
	if (sorted.length === 0) {
		return renderedText;
	}

	const restoreBackgroundAnsi = rowBgAnsi ?? fallbackBgAnsi ?? ANSI_BG_RESET;
	let highlighted = renderedText;
	for (let index = sorted.length - 1; index >= 0; index--) {
		const span = sorted[index];
		if (!span) {
			continue;
		}
		highlighted = applyBackgroundToVisibleRange(
			highlighted,
			span.start,
			span.end,
			emphasisBgAnsi,
			restoreBackgroundAnsi,
		);
	}

	return highlighted;
}

function resolveDiffIndicatorMode(config: FileDiffConfig): DiffIndicatorMode {
	return config.diffIndicatorMode;
}

function resolveIndicatorGlyph(kind: DiffLineKind, indicatorMode: DiffIndicatorMode, continuation: boolean): string {
	if (kind === "context") {
		return " ";
	}

	switch (indicatorMode) {
		case "bars":
			return "▌";
		case "classic":
			if (continuation) {
				return " ";
			}
			return kind === "add" ? "+" : "-";
		case "none":
		default:
			return " ";
	}
}

function colorizeSegment(
	theme: DiffTheme,
	color: "dim" | "toolDiffAdded" | "toolDiffRemoved",
	text: string,
	rowBg: string | undefined,
): string {
	let themedText: string;
	try {
		themedText = theme.fg(color, text);
	} catch {
		themedText = text;
	}

	if (!rowBg) {
		return themedText;
	}

	const stableText = keepBackgroundAcrossResets(themedText, rowBg);
	return `${rowBg}${stableText}${rowBg}`;
}

function keepBackgroundAcrossResets(text: string, rowBg: string): string {
	if (!text) {
		return text;
	}

	return text.replace(ANSI_SGR_PATTERN, (sequence, rawParams: string) => {
		const params = toSgrParams(rawParams);
		if (params.length === 0 || !sequenceResetsBackground(params)) {
			return sequence;
		}
		return `${sequence}${rowBg}`;
	});
}

function renderChangeMarker(
	kind: DiffLineKind,
	theme: DiffTheme,
	rowBg: string | undefined,
	indicatorMode: DiffIndicatorMode,
	continuation = false,
): string {
	const glyph = resolveIndicatorGlyph(kind, indicatorMode, continuation);
	if (glyph === " ") {
		return rowBg ? `${rowBg} ${rowBg}` : " ";
	}
	if (kind === "add") {
		return colorizeSegment(theme, "toolDiffAdded", glyph, rowBg);
	}
	if (kind === "remove") {
		return colorizeSegment(theme, "toolDiffRemoved", glyph, rowBg);
	}
	return colorizeSegment(theme, "dim", glyph, rowBg);
}

function usesHashlineGutter(showHashlineAnchors: boolean): boolean {
	return showHashlineAnchors;
}

function getHashlineGutterMarkerWidth(_indicatorMode: DiffIndicatorMode): number {
	return 0;
}

function getLineDividerPlainWidth(indicatorMode: DiffIndicatorMode, hashlineGutter = false): number {
	if (hashlineGutter) {
		return 2;
	}
	return indicatorMode === "classic" ? 1 : 2;
}

function renderCodeDivider(
	theme: DiffTheme,
	rowBg: string | undefined,
	indicatorMode: DiffIndicatorMode,
	hashlineGutter = false,
): string {
	return colorizeSegment(theme, "dim", hashlineGutter || indicatorMode !== "classic" ? "│ " : "│", rowBg);
}

function getLineNumberColor(kind: DiffLineKind): "dim" | "toolDiffAdded" | "toolDiffRemoved" {
	if (kind === "add") {
		return "toolDiffAdded";
	}
	if (kind === "remove") {
		return "toolDiffRemoved";
	}
	return "dim";
}

function renderLineNumberSegment(
	kind: DiffLineKind,
	lineNumber: string,
	theme: DiffTheme,
	rowBg: string | undefined,
): string {
	return colorizeSegment(theme, getLineNumberColor(kind), lineNumber, rowBg);
}

function getLinePrefixPlainWidth(lineNumberWidth: number, indicatorMode: DiffIndicatorMode, hashlineGutter = false): number {
	if (hashlineGutter) {
		return getHashlineGutterMarkerWidth(indicatorMode) + lineNumberWidth;
	}
	return indicatorMode === "bars"
		? visibleWidth(`▌ ${" ".repeat(lineNumberWidth)} `)
		: visibleWidth(`${" ".repeat(lineNumberWidth)} `);
}

function getLineContentIndicatorPrefixPlainWidth(indicatorMode: DiffIndicatorMode): number {
	return indicatorMode === "classic" ? 2 : 0;
}

function renderClassicContentPrefix(
	kind: DiffLineKind,
	theme: DiffTheme,
	rowBg: string | undefined,
	continuation = false,
): string {
	if (kind === "context" || continuation) {
		return rowBg ? `${rowBg}  ${rowBg}` : "  ";
	}

	const glyph = kind === "add" ? "+" : "-";
	const glyphColor = kind === "add" ? "toolDiffAdded" : "toolDiffRemoved";
	const spacer = rowBg ? `${rowBg} ` : " ";
	return `${colorizeSegment(theme, glyphColor, glyph, rowBg)}${spacer}`;
}

function renderLinePrefix(
	kind: DiffLineKind,
	lineNumber: string,
	theme: DiffTheme,
	rowBg: string | undefined,
	indicatorMode: DiffIndicatorMode,
	continuation = false,
	hashlineGutter = false,
): string {
	const number = renderLineNumberSegment(kind, lineNumber, theme, rowBg);
	if (hashlineGutter) {
		return number;
	}
	const spacer = rowBg ? `${rowBg} ` : " ";
	if (indicatorMode !== "bars") {
		return `${number}${spacer}`;
	}
	const marker = renderChangeMarker(kind, theme, rowBg, indicatorMode, continuation);
	return `${marker}${spacer}${number}${spacer}`;
}

function renderLineContinuationPrefix(
	kind: DiffLineKind,
	lineNumberWidth: number,
	rowBg: string | undefined,
	theme: DiffTheme,
	indicatorMode: DiffIndicatorMode,
	hashlineGutter = false,
): string {
	const blankLineNumber = " ".repeat(lineNumberWidth);
	return renderLinePrefix(kind, blankLineNumber, theme, rowBg, indicatorMode, true, hashlineGutter);
}

function renderLineContentIndicatorPrefix(
	kind: DiffLineKind,
	theme: DiffTheme,
	rowBg: string | undefined,
	indicatorMode: DiffIndicatorMode,
	continuation = false,
): string {
	return indicatorMode === "classic"
		? renderClassicContentPrefix(kind, theme, rowBg, continuation)
		: "";
}

function renderCompactLinePrefix(
	kind: DiffLineKind,
	theme: DiffTheme,
	rowBg: string | undefined,
	indicatorMode: DiffIndicatorMode,
	continuation = false,
): string {
	const marker = renderChangeMarker(kind, theme, rowBg, indicatorMode, continuation);
	const spacer = rowBg ? `${rowBg} ` : " ";
	return `${marker}${spacer}`;
}

interface LineCellRenderParams {
	kind: DiffLineKind;
	code: string;
	width: number;
	rowBg: string | undefined;
	restoreBgAnsi: string | undefined;
	theme: DiffTheme;
	wordWrap: boolean;
	indicatorMode: DiffIndicatorMode;
}

function renderWrappedRowsWithOptionalBackground(
	wrappedCodeLines: string[],
	buildRow: (index: number, wrappedCodeLine: string) => string,
	width: number,
	rowBg: string | undefined,
	restoreBgAnsi: string | undefined,
): string[] {
	if (!rowBg) {
		return wrappedCodeLines.map((wrappedCodeLine, index) =>
			stabilizeBackgroundResets(buildRow(index, wrappedCodeLine)),
		);
	}
	const safeRestoreBgAnsi = restoreBgAnsi ?? rowBg ?? ANSI_BG_RESET;
	const visualRows = wrappedCodeLines.map((wrappedCodeLine, index) => buildRow(index, wrappedCodeLine));
	return applyLineBackgroundToWrappedRows(visualRows, width, rowBg, safeRestoreBgAnsi);
}

function computeLineCellCodeWidth(
	width: number,
	lineNumberWidth: number,
	indicatorMode: DiffIndicatorMode,
	hashlineGutter: boolean,
): number {
	const prefixPlainWidth = getLinePrefixPlainWidth(lineNumberWidth, indicatorMode, hashlineGutter);
	const dividerPlainWidth = getLineDividerPlainWidth(indicatorMode, hashlineGutter);
	const contentIndicatorWidth = hashlineGutter ? 0 : getLineContentIndicatorPrefixPlainWidth(indicatorMode);
	return Math.max(0, width - prefixPlainWidth - dividerPlainWidth - contentIndicatorWidth);
}

function buildLineCellParams(
	kind: DiffLineKind,
	code: string,
	width: number,
	rowBg: string | undefined,
	restoreBgAnsi: string | undefined,
	theme: DiffTheme,
	wordWrap: boolean,
	indicatorMode: DiffIndicatorMode,
): LineCellRenderParams {
	return { kind, code, width, rowBg, restoreBgAnsi, theme, wordWrap, indicatorMode };
}

function renderCompactLineCell({ kind, code, width, rowBg, restoreBgAnsi, theme, wordWrap, indicatorMode }: LineCellRenderParams): string[] {
	if (width <= 0) {
		return [""];
	}

	const prefix = renderCompactLinePrefix(kind, theme, undefined, indicatorMode);
	const continuationPrefix = renderCompactLinePrefix(kind, theme, undefined, indicatorMode, true);
	const prefixPlainWidth = 2;
	const codeWidth = Math.max(0, width - prefixPlainWidth);
	const wrappedCodeLines = wrapToWidth(code, codeWidth, wordWrap);
	return renderWrappedRowsWithOptionalBackground(
		wrappedCodeLines,
		(index, line) => `${index === 0 ? prefix : continuationPrefix}${line}`,
		width,
		rowBg,
		restoreBgAnsi,
	);
}

function renderLineCell(
	{ kind, code, width, rowBg, restoreBgAnsi, theme, wordWrap, indicatorMode }: LineCellRenderParams,
	lineNumber: string,
	hashlineGutter = false,
): string[] {
	if (width <= 0) {
		return [""];
	}

	const codeWidth = computeLineCellCodeWidth(width, lineNumber.length, indicatorMode, hashlineGutter);
	const prefix = renderLinePrefix(kind, lineNumber, theme, undefined, indicatorMode, false, hashlineGutter);
	const continuationPrefix = renderLineContinuationPrefix(kind, lineNumber.length, undefined, theme, indicatorMode, hashlineGutter);
	const divider = renderCodeDivider(theme, undefined, indicatorMode, hashlineGutter);
	const firstContentPrefix = hashlineGutter ? "" : renderLineContentIndicatorPrefix(kind, theme, undefined, indicatorMode);
	const continuationContentPrefix = hashlineGutter ? "" : renderLineContentIndicatorPrefix(kind, theme, undefined, indicatorMode, true);
	const wrappedCodeLines = wrapToWidth(code, codeWidth, wordWrap);
	return renderWrappedRowsWithOptionalBackground(
		wrappedCodeLines,
		(index, line) => {
			const linePrefix = index === 0 ? prefix : continuationPrefix;
			const contentPrefix = index === 0 ? firstContentPrefix : continuationContentPrefix;
			return `${linePrefix}${divider}${contentPrefix}${line}`;
		},
		width,
		rowBg,
		restoreBgAnsi,
	);
}

function highlightDiffLine(
	codeText: string,
	entry: DiffLineEntry,
	inlineHighlights: WeakMap<DiffLineEntry, DiffSpan[]>,
	palette: DiffPalette,
	highlightLine: CodeLineHighlighter,
	containerBgAnsi: string | undefined,
): { highlighted: string; rowBg: string | undefined } {
	const syntaxHighlighted = highlightLine(codeText);
	const rowBg = getLineBackground(entry.lineKind, palette, false);
	const emphasisBg = getLineBackground(entry.lineKind, palette, true);
	const inlineSpans = inlineHighlights.get(entry) ?? [];
	const highlighted = applyInlineSpanHighlight(codeText, syntaxHighlighted, inlineSpans, emphasisBg, rowBg, containerBgAnsi);
	return { highlighted, rowBg };
}

function pushDiffLineRows(rows: RenderedRow[], lines: string[], entry: DiffLineEntry): void {
	rows.push(
		...lines.map((text) => ({
			text,
			hunkIndex: entry.hunkIndex || null,
		})),
	);
}

interface DiffRenderContext {
	width: number;
	theme: DiffTheme;
	inlineHighlights: WeakMap<DiffLineEntry, DiffSpan[]>;
	palette: DiffPalette;
	highlightLine: CodeLineHighlighter;
	containerBgAnsi: string | undefined;
	wordWrap: boolean;
	indicatorMode: DiffIndicatorMode;
	showHashlineAnchors: boolean;
}

function processDiffEntries(
	entries: ParsedDiffEntry[],
	ctx: DiffRenderContext,
	processLine: (entry: DiffLineEntry) => string[],
): RenderedRow[] {
	const { width, theme, wordWrap } = ctx;
	const rows: RenderedRow[] = [];
	for (const entry of entries) {
		if (entry.kind !== "line") {
			rows.push(...formatMetaEntryRows(entry, width, theme, wordWrap));
			continue;
		}
		pushDiffLineRows(rows, processLine(entry), entry);
	}
	return rows;
}

function renderUnified(
	entries: ParsedDiffEntry[],
	ctx: DiffRenderContext,
	lineNumberWidth: number,
): RenderedRow[] {
	return processDiffEntries(entries, ctx, (entry) => {
		const lineNumber = entry.lineKind === "add"
			? formatLineNumberLabel(entry, entry.newLineNumber, entry.fallbackLineNumber, lineNumberWidth, ctx.showHashlineAnchors)
			: formatLineNumberLabel(entry, entry.oldLineNumber, entry.fallbackLineNumber, lineNumberWidth, ctx.showHashlineAnchors);
		const codeText = normalizeCodeWhitespace(entry.content);
		const { highlighted, rowBg } = highlightDiffLine(codeText, entry, ctx.inlineHighlights, ctx.palette, ctx.highlightLine, ctx.containerBgAnsi);
		return renderLineCell(
			buildLineCellParams(entry.lineKind, highlighted, ctx.width, rowBg, ctx.containerBgAnsi, ctx.theme, ctx.wordWrap, ctx.indicatorMode),
			lineNumber,
			usesHashlineGutter(ctx.showHashlineAnchors),
		);
	});
}

function renderCompact(
	entries: ParsedDiffEntry[],
	ctx: DiffRenderContext,
): RenderedRow[] {
	return processDiffEntries(entries, ctx, (entry) => {
		const codeText = normalizeCodeWhitespace(getCompactLineRenderContent(entry, ctx.showHashlineAnchors));
		const { highlighted, rowBg } = highlightDiffLine(codeText, entry, ctx.inlineHighlights, ctx.palette, ctx.highlightLine, ctx.containerBgAnsi);
		return renderCompactLineCell(buildLineCellParams(entry.lineKind, highlighted, ctx.width, rowBg, ctx.containerBgAnsi, ctx.theme, ctx.wordWrap, ctx.indicatorMode));
	});
}

function renderDiffStatBar(stats: DiffStats, width: number, theme: DiffTheme): string | null {
	const totalChanges = stats.added + stats.removed;
	if (totalChanges === 0 || width < 20) {
		return null;
	}

	const barSlots = Math.max(8, Math.min(24, Math.floor(width / 12)));
	let addedSlots = Math.max(0, Math.min(barSlots, Math.round((stats.added / totalChanges) * barSlots)));
	if (stats.added > 0 && addedSlots === 0) {
		addedSlots = 1;
	}
	if (stats.removed > 0 && addedSlots >= barSlots) {
		addedSlots = barSlots - 1;
	}
	const removedSlots = Math.max(0, barSlots - addedSlots);

	const addedBar = addedSlots > 0 ? theme.fg("toolDiffAdded", "━".repeat(addedSlots)) : "";
	const removedBar = removedSlots > 0 ? theme.fg("toolDiffRemoved", "━".repeat(removedSlots)) : "";
	return stabilizeBackgroundResets(`${theme.fg("dim", "[")}${addedBar}${removedBar}${theme.fg("dim", "]")}`);
}

function buildDiffSummaryBasePieces(stats: DiffStats, theme: DiffTheme, label: string): string[] {
	return [
		theme.fg("toolOutput", `↳ ${emphasis(theme, label)}`),
		theme.fg("toolDiffAdded", `+${stats.added}`),
		theme.fg("toolDiffRemoved", `-${stats.removed}`),
	];
}

function renderHeaderRows(stats: DiffStats, mode: Exclude<DiffPresentationMode, "summary">, width: number, theme: DiffTheme, label: string): RenderedRow[] {
	if (mode === "compact") {
		const summary = buildDiffSummaryBasePieces(stats, theme, label).join(" ");
		return [{ text: stabilizeBackgroundResets(truncateToWidth(summary, width)), hunkIndex: null }];
	}

	const summaryPieces = [
		...buildDiffSummaryBasePieces(stats, theme, label),
		theme.fg("muted", `${stats.hunks} ${pluralize(stats.hunks, "hunk")}`),
		theme.fg("muted", `${stats.files} ${pluralize(stats.files, "file")}`),
		theme.fg("muted", mode),
	];

	const summary = summaryPieces.join(theme.fg("muted", " • "));
	const meter = renderDiffStatBar(stats, width, theme);
	if (!meter) {
		return [{ text: stabilizeBackgroundResets(truncateToWidth(summary, width)), hunkIndex: null }];
	}

	const meterSeparator = " ";
	const meterWidth = visibleWidth(meterSeparator) + visibleWidth(meter);
	if (meterWidth >= width) {
		return [{ text: stabilizeBackgroundResets(truncateToWidth(summary, width)), hunkIndex: null }];
	}

	const summaryWidth = Math.max(0, width - meterWidth);
	const fittedSummary = truncateToWidth(summary, summaryWidth);
	return [{ text: stabilizeBackgroundResets(`${fittedSummary}${meterSeparator}${meter}`), hunkIndex: null }];
}

function renderDiffFrameLine(width: number, theme: DiffTheme): string {
	const frameWidth = Math.max(0, width);
	if (frameWidth === 0) {
		return "";
	}
	return stabilizeBackgroundResets(theme.fg("dim", "─".repeat(frameWidth)));
}

function renderDiffSpacerLine(width: number): string {
	const safeWidth = Math.max(0, width);
	return safeWidth > 0 ? " ".repeat(safeWidth) : "";
}

function applyLineLimit(
	rows: RenderedRow[],
	width: number,
	expanded: boolean,
	maxCollapsedLines: number,
	maxExpandedLines: number,
	totalHunks: number,
	theme: DiffTheme,
): string[] {
	const expandedLimit = Number.isFinite(maxExpandedLines)
		? maxExpandedLines
		: FILE_DIFF_CONFIG.expandedPreviewMaxLines;
	const collapsedLimit = Number.isFinite(maxCollapsedLines)
		? maxCollapsedLines
		: FILE_DIFF_CONFIG.diffCollapsedLines;
	const limit = expanded ? Math.max(0, expandedLimit) : Math.max(1, collapsedLimit);
	if (limit === 0 || rows.length <= limit) {
		return rows.map((row) => clampDiffLineToWidth(row.text, width));
	}

	const shown = rows.slice(0, limit);
	const remaining = rows.length - shown.length;
	const visibleHunks = new Set(
		shown
			.map((row) => row.hunkIndex)
			.filter((hunkIndex): hunkIndex is number => typeof hunkIndex === "number" && hunkIndex > 0),
	);
	const hiddenHunks = Math.max(0, totalHunks - visibleHunks.size);
	const hintText = buildCollapsedDiffHintText(
		{
			remainingLines: remaining,
			hiddenHunks,
		},
		width,
		DIFF_WIDTH_OPS,
	);

	return [
		...shown.map((row) => clampDiffLineToWidth(row.text, width)),
		renderDiffSpacerLine(width),
		clampDiffLineToWidth(theme.fg(expanded ? "warning" : "muted", hintText), width),
	];
}

function renderSingleDiffRow(text: string, color: string, width: number, theme: DiffTheme): string[] {
	if (width <= 0) return [""];
	return [clampDiffLineToWidth(stabilizeBackgroundResets(theme.fg(color, text)), width)];
}

function safeGetDiff(details: unknown): string {
	if (!details || typeof details !== "object") {
		return "";
	}
	const typed = details as Partial<EditToolDetails>;
	return typeof typed.diff === "string" ? typed.diff : "";
}

function createDiffRenderCache() {
	let cachedWidth: number | undefined;
	let cachedExpanded: boolean | undefined;
	let cachedMode: DiffPresentationMode | undefined;
	let cachedLines: string[] | undefined;

	return {
		get(width: number, expanded: boolean, mode: DiffPresentationMode): string[] | undefined {
			if (cachedLines && cachedWidth === width && cachedExpanded === expanded && cachedMode === mode) {
				return cachedLines;
			}
			return undefined;
		},
		set(width: number, expanded: boolean, mode: DiffPresentationMode, lines: string[]): string[] {
			cachedWidth = width;
			cachedExpanded = expanded;
			cachedMode = mode;
			cachedLines = lines;
			return lines;
		},
		invalidate(): void {
			cachedWidth = undefined;
			cachedExpanded = undefined;
			cachedMode = undefined;
			cachedLines = undefined;
		},
	};
}

export function renderCompletedDiff(
	details: unknown,
	options: DiffRenderOptions,
	theme: DiffTheme,
): Component {
	const config = FILE_DIFF_CONFIG;
	const label = options.headerLabel?.trim() || "diff";
	const diffText = safeGetDiff(details);
	if (!diffText.trim()) {
		return new Text(theme.fg("muted", "↳ no diff payload"), 0, 0);
	}

	let parsed: ParsedDiff;
	try {
		parsed = parseDiff(diffText);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return new Text(theme.fg("warning", `↳ unable to render diff: ${message}`), 0, 0);
	}

	const entries = options.hideHunkHeaders
		? parsed.entries.filter((entry) => entry.kind !== "hunk")
		: parsed.entries;
	if (entries.length === 0) {
		return new Text(theme.fg("muted", "↳ no diff data"), 0, 0);
	}

	const splitRows = buildSplitRows(entries);
	const showHashlineAnchors = options.expanded === true
		&& entries.some((entry) => entry.kind === "line" && !!entry.hashlineAnchorContent);
	const lineNumberWidth = getLineNumberWidth(entries, showHashlineAnchors);
	const palette = resolveDiffPalette(theme);
	const containerBgAnsi = resolveContainerBackgroundAnsi(theme);
	const language = resolveLanguageFromPath(options.filePath);
	const highlightLine = createCodeLineHighlighter(language);
	const wordWrap = config.diffWordWrap;
	const indicatorMode = resolveDiffIndicatorMode(config);

	const cache = createDiffRenderCache();

	return {
		render(width: number): string[] {
			const safeWidth = normalizeDiffRenderWidth(width);
			const mode = resolveDiffPresentationMode(safeWidth);
			const cached = cache.get(safeWidth, options.expanded, mode);
			if (cached) {
				return cached;
			}

			if (mode === "summary") {
				return cache.set(safeWidth, options.expanded, mode, clampDiffLinesToWidth(renderSingleDiffRow(buildDiffSummaryText(parsed.stats, safeWidth, label), "toolOutput", safeWidth, theme), safeWidth));
			}

			const headerRows = renderHeaderRows(parsed.stats, mode, safeWidth, theme, label);
			const inlineHighlights = buildInlineHighlightMap(splitRows);
			const bodyRows = mode === "compact"
					? renderCompact(
						entries,
						{ width: safeWidth, theme, inlineHighlights, palette, highlightLine, containerBgAnsi, wordWrap, indicatorMode, showHashlineAnchors },
					)
					: renderUnified(
						entries,
						{ width: safeWidth, theme, inlineHighlights, palette, highlightLine, containerBgAnsi, wordWrap, indicatorMode, showHashlineAnchors },
						lineNumberWidth,
					);
			const bodyWithLimit = applyLineLimit(
				bodyRows,
				safeWidth,
				options.expanded,
				config.diffCollapsedLines,
				config.expandedPreviewMaxLines,
				parsed.stats.hunks,
				theme,
			);
			const frame = renderDiffFrameLine(safeWidth, theme);
			const renderedLines = mode === "unified"
				? [...headerRows.map((row) => row.text), frame, ...bodyWithLimit, frame]
				: [...headerRows.map((row) => row.text), ...bodyWithLimit];

			const clampedLines = clampDiffLinesToWidth(renderedLines, safeWidth);
			return cache.set(safeWidth, options.expanded, mode, clampedLines);
		},
		invalidate: cache.invalidate,
	};
}
