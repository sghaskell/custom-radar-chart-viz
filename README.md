# Splunk Custom Radar Chart Visualization

# Synopsis
Plot multivariate data on a two dimensional chart across axes.

# Credits
### Included Open Source Software
##### [Re-usable updating radarChart](http://bl.ocks.org/TennisVisuals/c591445c3e6773c6eb6f)
##### [d3.js](https://d3js.org/)
##### [d3-legend](https://github.com/susielu/d3-legend)
##### [Jquery](https://jquery.com/)
##### [Underscore.js](http://underscorejs.org/)
##### [Webpack](https://webpack.github.io/)
##### [transform-loader](https://www.npmjs.com/package/transform-loader)
##### [brfs](https://www.npmjs.com/package/brfs)

# Required Fields
##### key
Key to graph
##### axis
Axis to plot
##### value
Value for key,axis pair

# Optional Fields
##### keyColor
Append to each key,axis,value row to dynamically style the area color. Must be a hex value.

# Sample Searches
```
| makeresults 
| eval key="current", "Business Value"=.37, Enablement=8.64, Foundations=2.56, Governance=1.68, "Operational Excellence"=4.992, "Community"=9.66 
| untable key,"axis","value" 
| eval keyColor="magenta"| append
    [| makeresults
    | eval key="better", "Business Value"=9.37, Enablement=2.64, Foundations=4.56, Governance=6.68, "Operational Excellence"=9.992, "Community"=9.66 
    | untable key,"axis","value" 
    | eval keyColor="#33FF55"
        ]
```

# Formatting Options
### General
###### Height
Chart Height
###### Width
Chart Width
###### Max Value
Maximum value
###### Levels
Number of levels for chart
###### Format
Format the scale - see [d3-format docs](https://github.com/d3/d3-format)
###### Rounded
Enable or disable rounded lines between conncting points
###### Full Screen Mode
Enable or disable full screen mode. Dynamically adjust chart size from browser resize.

### Legend
###### Show Legend
Enable or disable legend
###### Legend Symbol
Symobl used for each legend key
###### Legend Toggle Symbol
Symbol used when key is toggled
###### Position X
Position of legend on X axis
###### Position Y
Position of legend on Y axis

### Colors
###### Axes Line Color
Color of line that divides the axes (Hex value)
###### Circles Color
Color of circles (Hex value)
###### Circles Fill Color
Fill color of circles (Hex value)

### Opacity
###### Areas Opacity
Opacity of the area on chart (range: 0 - 1.0)
###### Circles Opacity
Opacity of circles (range: 0 - 1.0)

# Support
###### This app is supported by Scott Haskell ([shaskell@splunk.com](mailto:shaskell@splunk.com))
