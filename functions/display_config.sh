#!/usr/bin/env bash
#
# Configure display configuration

display_config() {

  case $1 in
  'triple')
    displayplacer "id:E903A80E-62F1-4937-491A-5E353E4F10EF res:2560x1440 hz:60 color_depth:8 scaling:on origin:(0,0) degree:0" "id:66F0EB2B-C11B-26BE-6B94-9059E7CFFE9E res:1792x1120 hz:59 color_depth:8 scaling:on origin:(-1792,1033) degree:0" "id:C6F28A32-5187-9713-04E8-9C6D085A3295 res:1680x1050 hz:60 color_depth:8 scaling:on origin:(-1680,-17) degree:0"
    ;;
  'dual')
    displayplacer "id:66F0EB2B-C11B-26BE-6B94-9059E7CFFE9E res:1792x1120 hz:59 color_depth:8 scaling:on origin:(0,0) degree:0" "id:C6F28A32-5187-9713-04E8-9C6D085A3295 res:1680x1050 hz:60 color_depth:8 scaling:on origin:(-1680,70) degree:0"
    ;;
  'dual-staggered')
    displayplacer "id:E903A80E-62F1-4937-491A-5E353E4F10EF res:2560x1440 hz:60 color_depth:8 scaling:on origin:(0,0) degree:0" "id:66F0EB2B-C11B-26BE-6B94-9059E7CFFE9E res:1792x1120 hz:59 color_depth:4 scaling:on origin:(-1792,790) degree:0"
    ;;
  'dual-high')
    displayplacer "id:66F0EB2B-C11B-26BE-6B94-9059E7CFFE9E res:1792x1120 hz:59 color_depth:8 scaling:on origin:(0,0) degree:0" "id:C6F28A32-5187-9713-04E8-9C6D085A3295 res:1920x1200 hz:60 color_depth:8 scaling:on origin:(-1920,70) degree:0"
    ;;
  'triple-presenting')
    displayplacer "id:7B936FC2-F7FF-A24A-C5D6-8576137BB3D1+66F0EB2B-C11B-26BE-6B94-9059E7CFFE9E res:1920x1080 hz:30 color_depth:8 scaling:on origin:(0,0) degree:0" "id:C6F28A32-5187-9713-04E8-9C6D085A3295 res:1920x1200 hz:60 color_depth:8 scaling:on origin:(-1920,0) degree:0"
    ;;
  *) ;;
  esac
}
