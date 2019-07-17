/*
 * Visualization source
 * Author: Scott Haskell
 * Date: 10/25/2017
 * Company: Splunk Inc.
 */
define([
            'jquery',
            'underscore',
            'api/SplunkVisualizationBase',
            'api/SplunkVisualizationUtils',
            'd3',
            '../contrib/js/d3-legend',
            '../contrib/js/d3-radar-chart'
        ],
        function(
            $,
            _,
            SplunkVisualizationBase,
            SplunkVisualizationUtils 
        ) {
  
    // Extend from SplunkVisualizationBase
    return SplunkVisualizationBase.extend({
        validFields: ["key","axis","value","keyColor"],
        allAxes: [],
        categories: {},
        defaultConfig: {
            'display.visualizations.custom.custom-radar-chart-viz.radar_chart.chartHeight': 500,
            'display.visualizations.custom.custom-radar-chart-viz.radar_chart.chartWidth': 500,
            'display.visualizations.custom.custom-radar-chart-viz.radar_chart.maxValue': 1,
            'display.visualizations.custom.custom-radar-chart-viz.radar_chart.maxValue': 5,
            'display.visualizations.custom.custom-radar-chart-viz.radar_chart.levels': 8,
            'display.visualizations.custom.custom-radar-chart-viz.radar_chart.format': "",
            'display.visualizations.custom.custom-radar-chart-viz.radar_chart.isRounded': "1",
            'display.visualizations.custom.custom-radar-chart-viz.radar_chart.fullScreen': "0",
            'display.visualizations.custom.custom-radar-chart-viz.radar_chart.legendEnabled': "1",
            'display.visualizations.custom.custom-radar-chart-viz.radar_chart.legendSymbol': "cross",
            'display.visualizations.custom.custom-radar-chart-viz.radar_chart.legendToggleSymbol': "circle",
            'display.visualizations.custom.custom-radar-chart-viz.radar_chart.legendPositionX': 25,
            'display.visualizations.custom.custom-radar-chart-viz.radar_chart.legendPositionY': 25,
            'display.visualizations.custom.custom-radar-chart-viz.radar_chart.legendFontColor': "black",
            'display.visualizations.custom.custom-radar-chart-viz.radar_chart.axesLineColor': "white",
            'display.visualizations.custom.custom-radar-chart-viz.radar_chart.axesLabelFontColor': "#737373",
            'display.visualizations.custom.custom-radar-chart-viz.radar_chart.axesLegendFontColor': "black",
            'display.visualizations.custom.custom-radar-chart-viz.radar_chart.circlesColor': "#CDCDCD",
            'display.visualizations.custom.custom-radar-chart-viz.radar_chart.circlesFillColor': "#CDCDCD",
            'display.visualizations.custom.custom-radar-chart-viz.radar_chart.areasOpacity': 0.35,
            'display.visualizations.custom.custom-radar-chart-viz.radar_chart.circlesOpacity': 0.1
        },
        //category: function(key, name, data) {
        category: function(key, options) {    
            this.key = key;
            this.axes = [];
            this.axes.push(options.name);
            this.isInit = false;
            this.isCharted = false;
            this.vals = [];

            if(!this.isInit) {
                this.vals.push({axis: options.name, value: options.data}); 
                this.isInit = true;
            }

            //this.update = function (name, data) {
            this.update = function (name, options) {
                this.vals.push({axis: name, value: options.data}); 
                this.axes.push(name);
            };

            this.fillMissingAxis = function(allAxes) {
                _.each(allAxes, function(v, i) {
                    if(!this.axes.includes(v)) {
                        this.vals.splice(i, 0, {axis: v, value: 0})
                        this.axes.splice(i, 0, v)
                    }
                }, this); 
            };
        }, 

        onConfigChange: function(configChanges, previousConfig) {
            const configBase = this.getPropertyNamespaceInfo().propertyNamespace
            legendEnabled = this._propertyExists('legendEnabled', configChanges) ? this.isArgTrue(parseInt(this._getEscapedProperty('legendEnabled', configChanges))):this.isArgTrue(parseInt(this._getEscapedProperty('legendEnabled', previousConfig)))

            if(legendEnabled) {
                this.radarChart.options({legend: {display: true}}).rounded(true).update()
                $('.rcLegend').show()
            } else {
                $('.rcLegend').hide()
            }
    
        },

        _propertyExists: function(name, config) {
            return _.has(config, this.getPropertyNamespaceInfo().propertyNamespace + name)
        },

        _getSafeUrlProperty: function(name, config) {
            var propertyValue = config[this.getPropertyNamespaceInfo().propertyNamespace + name]
            return SplunkVisualizationUtils.makeSafeUrl(propertyValue)
        },
        
        _getEscapedProperty: function(name, config) {
            var propertyValue = config[this.getPropertyNamespaceInfo().propertyNamespace + name];
            return SplunkVisualizationUtils.escapeHtml(propertyValue);
        },

        _getProperty: function(name, config) {
            var propertyValue = config[this.getPropertyNamespaceInfo().propertyNamespace + name];
            return propertyValue;
        },

        // Convert string '1/0' or 'true/false' to boolean true/false
        isArgTrue: function(arg) {
            if(arg === 1 || arg === 'true') {
                return true;
            } else {
                return false;
            }
        },

        // Valide field in results set and error out if it shouldn't be there
        validateFields: function(fields) {
            _.each(fields, function(v, i) {
                if(!_.contains(this.validFields, v.name)) {  
                   throw new SplunkVisualizationBase.VisualizationError(
                        "Invalid Field Detected => " + v.name + "; Required Fields: key, axis, value"
                    ); 
                }    
            }, this);
        },

        initialize: function() {
            SplunkVisualizationBase.prototype.initialize.apply(this, arguments);
            this.$el = $(this.el);
            this.isInitializedDom = false;
        },

        // Optionally implement to format data returned from search. 
        // The returned object will be passed to updateView as 'data'
        formatData: function(data) {
            // Clear axes and categories
            this.allAxes = []
            this.categories = {}

            if(!data.results || data.results.length === 0) {
                return this;
            }

            // Make sure the fields are named correctly
            this.validateFields(data.fields);

            _.each(data.results, function(v, i, obj) {
                try {
                    // Key exists, update
                    if(_.has(this.categories, v.key) && !this.categories[v.key].isCharted) {
                        this.categories[v.key].update(v.axis, {data: v.value});
                    } else {
                        if(v.key) {
                            // Create new category
                            var c = new this.category(v.key, {name: v.axis, data: v.value});
                            if(_.has(v, "keyColor")) {
                                c.keyColor = v.keyColor;
                            }
                            this.categories[v.key] = c
                        }
                    }
                    // Update global axes list
                    if(v.key && !this.allAxes.includes(v.axis)) {
                        this.allAxes.push(v.axis);
                    }
                } catch(err) {
                    console.error(err);
                }
            }, this);

            console.log(this.allAxes)
            // Fill in missing axes for each category
            _.each(this.categories, function(v, i) {
                v.fillMissingAxis(this.allAxes);  
            }, this); 
            
            return this.categories
        },
  
        // Implement updateView to render a visualization.
        //  'data' will be the data object returned from formatData or from the search
        //  'config' will be the configuration property object
        updateView: function(categories, config) {
            if(_.keys(config).length <= 1) {
                config = this.defaultConfig;
            }

            // Get Format menu parameters
            var chartHeight = parseInt(this._getEscapedProperty('chartHeight', config)) || 400,
                chartWidth = parseInt(this._getEscapedProperty('chartWidth', config)) || 400,
                maxValue = parseFloat(this._getEscapedProperty('maxValue', config)) || 1,
                levels = parseInt(this._getEscapedProperty('levels', config)) || 8,
                format = this._getEscapedProperty('format', config) || "",
                isRounded = parseInt(this._getEscapedProperty('isRounded', config)),
                fullScreen = parseInt(this._getEscapedProperty('fullScreen', config)),
                legendEnabled = parseInt(this._getEscapedProperty('legendEnabled', config)),
                legendSymbol= this._getEscapedProperty('legendSymbol', config) || "cross",
                legendToggleSymbol= this._getEscapedProperty('legendToggleSymbol', config) || "circle",
                legendPositionX = parseInt(this._getEscapedProperty('legendPositionX', config)) || 25,
                legendPositionY = parseInt(this._getEscapedProperty('legendPositionY', config)) || 25,
                legendFontColor = this._getEscapedProperty('legendFontColor', config) || "black",
                axesLineColor = this._getEscapedProperty('axesLineColor', config) || "white",
                axesLabelFontColor = this._getEscapedProperty('axesLabelFontColor', config) || "#737373",
                axesLegendFontColor = this._getEscapedProperty('axesLegendFontColor', config) || "black",
                circlesColor = this._getEscapedProperty('circlesColor', config) || "#CDCDCD",
                circlesFillColor = this._getEscapedProperty('circlesFillColor', config) || "#CDCDCD",
                areasOpacity = parseFloat(this._getEscapedProperty('areasOpacity', config)),
                circlesOpacity = parseFloat(this._getEscapedProperty('circlesOpacity', config))


            // Initialize Viz
            if (!this.isInitializedDom) {
                var radarChart = this.radarChart = {}
                var radarChartOptions = this.radarChartOptions = {}

				// Create radar chart
                this.radarChart = new RadarChart(format)
                
                d3.select(this.el)
                  .call(this.radarChart)

                this.isInitializedDom = true
            }

			// Set default options from format parameters
			this.radarChartOptions = {
				width: chartWidth,
				height: chartHeight,
				format: format,
				legend: {
					display: this.isArgTrue(legendEnabled),
					symbol: legendSymbol,
					toggle: legendToggleSymbol,
                    position: {x: legendPositionX, y: legendPositionY},
                    fontColor: legendFontColor
				},
				areas: {
					opacity: areasOpacity
				},
				circles: {
					color: circlesColor,
					fill: circlesFillColor,
					opacity: circlesOpacity
				},
				axes: {
                    lineColor: axesLineColor,
                    axesLabelFontColor: axesLabelFontColor,
                    axesLegendFontColor: axesLegendFontColor
				}
			};
			
			this.radarChart
				.options(this.radarChartOptions)
				.rounded(this.isArgTrue(isRounded))
				.maxValue(maxValue) 
				.levels(levels) 
				.update();

            // Get parent element of div to resize
            var parentEl = $(this.el).parent().parent().closest("div").attr("data-cid");

            // Map Full Screen Mode
            if (this.isArgTrue(fullScreen)) {
                var vh = $(window).height();
                var vw = $(window).width();
                $("div[data-cid=" + parentEl + "]").css("height", vh);

                $(window).resize(function() {
                    var vh = $(window).height();
                    $("div[data-cid=" + parentEl + "]").css("height", vh);
                });
                this.radarChart.options({height: vh, width: vw}).update();
            } else {
                $("div[data-cid=" + parentEl + "]").css("height", chartHeight);
                this.radarChart.options({height: chartHeight, width: chartWidth}).update();
            }

            _.each(categories, function(v, i, obj) {
                try {
                    if(!v.isCharted) {
                        this.radarChart.push({key: v.key, values: v.vals});
                        // Check for custom color and set
                        if(v.keyColor) {
                            // get current colors so we don't clobber them
                            var c = this.radarChart.colors();
                            c[v.key] = v.keyColor;
                            this.radarChart.colors(c);
                        }
                        // We've charted it
                        v.isCharted = true;
                    }
                } catch (err) {
                    console.error(err);
                }
            }, this); 

            this.radarChart.update();

            return this;
            },

        // Search data params
        getInitialDataParams: function() {
            return ({
                outputMode: SplunkVisualizationBase.RAW_OUTPUT_MODE,
                count: 50000
            });
        },

        // Override to respond to re-sizing events
        reflow: function() {
            this.invalidateUpdateView();
        },
    });
});
