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
# Support
###### This app is supported by Scott Haskell ([shaskell@splunk.com](mailto:shaskell@splunk.com))
