document.addEventListener("DOMContentLoaded", startScripts());



function buildChart(conteinerSelector, dataObj, settingsObj) {

	// ========================================================================
	// Default SETTINGS
	if ( typeof settingsObj !== 'object' ) {
		settingsObj = {};
	}	

	defaultSettingsObj = {
		svgWidth: 1000,
		svgHeigth: 500,
		svgMargin: {top: 20, right: 270, bottom: 50, left: 60},
		svgBorder: '2px solid #999',
		svgAxis: {xRange:[0, 60], yRange:[0, 100], xLabel: 'WEEK', yLabel: 'PERCENT', labelColor: '#666', fontSize: 16},

		legendBorder: '1px solid #999',
		legendFontSize: 18,

		strokeWidth: 3,
		strokeTransitionTime: 2000,

		chartPointRadius: 5,
		chartPointLabelFontSize: 18,
	}

	for (var i in defaultSettingsObj){
		if ( typeof settingsObj[i] !== typeof defaultSettingsObj[i] ) {
			settingsObj[i] = defaultSettingsObj[i]
		}
	}
	// ========================================================================


	var data = dataObj;

	var svgW = settingsObj.svgWidth, 
		svgH = settingsObj.svgHeigth,
		margin = settingsObj.svgMargin,
		chartW = svgW - ( margin.left + margin.right ),
		chartH = svgH - ( margin.top + margin.bottom );


	// ========================================================================
	// Create SVG Element
	var svgEl = d3.select(conteinerSelector).append('svg')
		// .attr('width', svgW)
		// .attr('height', svgH)
		.attr('viewBox', '0 0 ' + svgW + ' ' + svgH)
		.attr('preserveAspectRatio', "xMidYMid meet")
		.style('border', settingsObj.svgBorder);
	// ========================================================================


	// ========================================================================
	// Create Svg_CANVAS
	var svgCanvas = svgEl.append('g')
		.attr("class", "charts_canvas")
		.attr('width', chartW)
		.attr('height', chartH)
		.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
	// ========================================================================


	// ========================================================================
	// Create LEGEND
	var legend = svgEl.append("g")
		.attr("class", "charts_legend")
		.attr("transform", 'translate(' + (svgW - (margin.right - 70 )) + ', ' + (chartH/2 - 35) + ')')
		.style('border', settingsObj.legendBorder)
	// ========================================================================


	// ========================================================================
	// AXIS

	// Scale X func
	var xAxisScale = d3.scaleLinear()
		.domain(settingsObj.svgAxis.xRange)
		.rangeRound([0, chartW]);	

	// Scale Y func
	var yAxisScale = d3.scaleLinear()
		.domain(settingsObj.svgAxis.yRange)
		.rangeRound([chartH, 0]);

	// Add the x Axis
	var xAxis = svgEl.append("g")
		.attr("transform", "translate(" + margin.left + "," + (chartH + margin.top) + ")")
		.call(d3.axisBottom(xAxisScale));

	// Label Text for the X axis
	svgEl.append("text")
		.attr('x', (margin.left + chartW/2))
		.attr('y', (chartH + margin.top + 40))
		.style("text-anchor", "middle")
		.style("fill", settingsObj.svgAxis.labelColor)
		.text(settingsObj.svgAxis.xLabel);

	// Add the Y Axis
	var yAxis = svgEl.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.call(d3.axisLeft(yAxisScale));

	// Label Text for the Y axis
	svgEl.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", 0 - (svgH / 2))
		.attr("y", 10)
		.attr("dy", "1em")
		.style("text-anchor", "middle")
		.style("fill", settingsObj.svgAxis.labelColor)
		.text(settingsObj.svgAxis.yLabel);
	// ========================================================================



	// ========================================================================
	// BUILD CHARTs

	// Line GENERATOR
	var lineGeneration = d3.line()
		.x(function(d) { return xAxisScale(d.x); })
		.y(function(d) { return yAxisScale(d.y); });

	for (var i = 0; i < data.length; i++) {

		// ==========================================
		// LINE Creator
		var addLine = svgCanvas
			.data([data[i].dataSet])
			.append("path")
			.attr("d", lineGeneration )

			.attr("stroke", function(d){ 
				return data[i].color; 
			})
			.attr("stroke-width", settingsObj.strokeWidth)
			.attr("fill", "none")
			.attr("data-legend",function(d) {
				return data[i].name;
			});

		var totalLength = addLine.node().getTotalLength();

		addLine
			.attr("stroke-dasharray", totalLength + " " + totalLength)
			.attr("stroke-dashoffset", totalLength)
			.transition()
			.duration(settingsObj.strokeTransitionTime)
			.attr("stroke-dashoffset", 0);


		// ==========================================
		// Add DOTs to Every Line and Group them
		svgCanvas.append('g')
			.selectAll('circle')
			.data(data[i].pointSet)
			.enter()
			.append('circle')

			.attr('cx', function(d) {
				return xAxisScale(d.x);
			})
			.attr('cy', function(d) {
				return yAxisScale(d.y);
			})
			.attr('r', settingsObj.chartPointRadius)

			.style('fill', '#fff')
			.transition()
			.duration(settingsObj.strokeTransitionTime)
			.style('fill', data[i].color);


		// ==========================================
		// Add DOTs LABELS to Every Line and Group them
		var dotLabel = svgCanvas.append('g')
			.selectAll('text')
			.data(data[i].pointSet)
			.enter()
			.append('text')
			.text( function(d) {
				return (d.y + '%');
			})
			.style("text-anchor", "middle")
			.style("alignment-baseline", "central")
			.style('font-size', settingsObj.chartPointLabelFontSize)
			

			if (data[i].labelsPos === "top") {
				dotLabel
					.attr('x', function(d) { return xAxisScale(d.x); })
					.attr('y', function(d) { return yAxisScale(d.y) - 20; })
			}
			else if (data[i].labelsPos === "bottom") {
				dotLabel
					.attr('x', function(d) { return xAxisScale(d.x); })
					.attr('y', function(d) { return yAxisScale(d.y) + 20; })
			}
			else if (data[i].labelsPos === "left") {
				dotLabel
					.attr('x', function(d) { return xAxisScale(d.x) - 35; })
					.attr('y', function(d) { return yAxisScale(d.y) })
			}
			else if (data[i].labelsPos === "right") {
				dotLabel
					.attr('x', function(d) { return xAxisScale(d.x) + 35; })
					.attr('y', function(d) { return yAxisScale(d.y) })
			}

			else if (data[i].labelsPos === "right-top") {
				dotLabel
					.attr('x', function(d) { return xAxisScale(d.x) + 30; })
					.attr('y', function(d) { return yAxisScale(d.y) - 15; })
			}
			else if (data[i].labelsPos === "right-bottom") {
				dotLabel
					.attr('x', function(d) { return xAxisScale(d.x) + 30; })
					.attr('y', function(d) { return yAxisScale(d.y) + 15; })
			}
			else if (data[i].labelsPos === "left-top") {
				dotLabel
					.attr('x', function(d) { return xAxisScale(d.x) - 30; })
					.attr('y', function(d) { return yAxisScale(d.y) - 15; })
			}
			else if (data[i].labelsPos === "left-bottom") {
				dotLabel
					.attr('x', function(d) { return xAxisScale(d.x) - 30; })
					.attr('y', function(d) { return yAxisScale(d.y) + 15; })
			}
			else {
				dotLabel
					.attr('x', function(d) { return xAxisScale(d.x) + 30; })
					.attr('y', function(d) { return yAxisScale(d.y) + 15; })
			}

		// Label Animation
		dotLabel
			.style('fill', '#fff')
			.transition()
			.duration(settingsObj.strokeTransitionTime)
			.style('fill', data[i].color);


		// ========================================================================
		// Build LEGEND

		legend.append("circle")
			.attr("cx", 0)
			.attr("cy", (i * 30) - 5 )
			.attr("r", 10 )
			.attr("width", 15)
			.attr("height", 15)
			.style("fill", function(d) { 
				return data[i].color;
			});

		legend.append("text")
			.attr("x", 20)
			.attr("y", i * 30)
			.style('font-size', settingsObj.legendFontSize)
			.text(function() {
				return data[i].name;
			})
			.style("fill", function(d) { 
				return data[i].color;
			})


		console.log(i, data[i].name);

		// ========================================================================



	};
	// ========================================================================
}


function startScripts() {

	// ========================================================================
	// DATA
		var dataChart_1_1 = [
				{
					'name': 'PASI 75',
					'color': '#a2cc95',
					'labelsPos': 'top',
					'dataSet': [
								{'x': 0, 'y': 0}, {'x': 1, 'y': 10}, {'x': 2, 'y': 20}, 
								{'x': 4, 'y': 55}, {'x': 8, 'y': 80}, {'x': 12, 'y': 87}, 
								{'x': 20, 'y': 88}, {'x': 32, 'y': 86}, {'x': 42, 'y': 86}, 
								{'x': 48, 'y': 85}, {'x': 54, 'y': 84}, {'x': 60, 'y': 83}
							],
					'pointSet':[
								{'x': 12, 'y': 87}, {'x': 60, 'y': 83}
							]
				},
				{
					'name': 'PASI 90',
					'color': '#49aa42',
					'labelsPos': 'right',
					'dataSet': [
								{'x': 0, 'y': 0}, {'x': 1.5, 'y': 5}, {'x': 2, 'y': 7}, 
								{'x': 4, 'y': 27}, {'x': 8, 'y': 54}, {'x': 12, 'y': 68}, 
								{'x': 20, 'y': 75}, {'x': 24, 'y': 77}, {'x': 32, 'y': 76}, 
								{'x': 48, 'y': 75}, {'x': 54, 'y': 74}, {'x': 60, 'y': 73}
							],
					'pointSet':[
								{'x': 12, 'y': 68}, {'x': 60, 'y': 73}
							]
				},
				{
					'name': 'PASI 100',
					'color': '#006225',
					'labelsPos': 'right',
					'dataSet': [
								{'x': 0, 'y': 0}, {'x': 1, 'y': 1}, {'x': 2, 'y': 3}, 
								{'x': 4, 'y': 10}, {'x': 8, 'y': 25}, {'x': 12, 'y': 38}, 
								{'x': 16, 'y': 45}, {'x': 24, 'y': 55}, {'x': 32, 'y': 54}, 
								{'x': 48, 'y': 55}, {'x': 54, 'y': 54}, {'x': 60, 'y': 55}
							],
					'pointSet':[
								{'x': 12, 'y': 38}, {'x': 60, 'y': 55}
							]
				}
			];

		var dataChart_1_2 = [
				{
					'name': 'PASI 75',
					'labelsPos': 'top',
					'color': '#a2cc95',
					'dataSet': [
								{'x': 0, 'y': 0}, {'x': 8, 'y': 80}, {'x': 12, 'y': 87}, 
								{'x': 16, 'y': 88}, {'x': 20, 'y': 89}, {'x': 24, 'y': 88}, 
								{'x': 32, 'y': 87},	{'x': 36, 'y': 86}, {'x': 40, 'y': 86}, 
								{'x': 44, 'y': 86}, {'x': 48, 'y': 84}, {'x': 55, 'y': 84}, 
								{'x': 60, 'y': 83}
							],
					'pointSet':[
								{'x': 12, 'y': 87}, {'x': 60, 'y': 83}
							]
				},
				{
					'name': 'sPGA 0 lub 1',
					'labelsPos': 'right-top',
					'color': '#c2cd23',
					'dataSet': [
								{'x': 0, 'y': 0}, {'x': 8, 'y': 74}, {'x': 12, 'y': 81}, 
								{'x': 16, 'y': 82}, {'x': 20, 'y': 81}, {'x': 24, 'y': 80}, 
								{'x': 32, 'y': 78}, {'x': 36, 'y': 79}, {'x': 40, 'y': 78}, 
								{'x': 44, 'y': 76}, {'x': 48, 'y': 74}, {'x': 55, 'y': 76}, 
								{'x': 60, 'y': 75}
							],
					'pointSet':[
								{'x': 12, 'y': 81}, {'x': 60, 'y': 75}
							]
				},
				{
					'name': 'PASI 90',
					'labelsPos': 'right-bottom',
					'color': '#49aa42',
					'dataSet': [
								{'x': 0, 'y': 0}, {'x': 8, 'y': 54}, {'x': 12, 'y': 68}, 
								{'x': 16, 'y': 74}, {'x': 20, 'y': 75}, {'x': 24, 'y': 78}, 
								{'x': 32, 'y': 78}, {'x': 36, 'y': 77}, {'x': 40, 'y': 77}, 
								{'x': 44, 'y': 75}, {'x': 48, 'y': 74}, {'x': 55, 'y': 74}, 
								{'x': 60, 'y': 73}
							],
					'pointSet':[
								{'x': 12, 'y': 68}, {'x': 60, 'y': 73}
							]
				},
				{
					'name': 'PASI 100',
					'labelsPos': 'right',
					'color': '#006225',
					'dataSet': [
								{'x': 0, 'y': 0}, {'x': 8, 'y': 25}, {'x': 12, 'y': 38}, 
								{'x': 16, 'y': 46}, {'x': 20, 'y': 50}, {'x': 24, 'y': 56}, 
								{'x': 32, 'y': 56}, {'x': 36, 'y': 57}, {'x': 40, 'y': 57}, 
								{'x': 44, 'y': 55}, {'x': 48, 'y': 55}, {'x': 52, 'y': 54}, 
								{'x': 55, 'y': 55}, {'x': 60, 'y': 55}
							],
					'pointSet':[
								{'x': 12, 'y': 38}, {'x': 60, 'y': 55}
							]
				}
			];

		var dataChart_1_3 = [
				{
					'name': 'PASI 75',
					'labelsPos': 'top',
					'color': '#a2cc95',
					'dataSet': [
									{'x': 0, 'y': 0}, {'x': 4, 'y': 50}, {'x': 8, 'y': 80}, 
									{'x': 12, 'y': 84}, {'x': 16, 'y': 86}, {'x': 20, 'y': 88}, 
									{'x': 24, 'y': 84}, {'x': 28, 'y': 83}, {'x': 32, 'y': 83}, 
									{'x': 36, 'y': 82}, {'x': 40, 'y': 82}, {'x': 44, 'y': 82}, 
									{'x': 48, 'y': 81}, {'x': 52, 'y': 81}, {'x': 55, 'y': 81},
									{'x': 60, 'y': 80},
							],
					'pointSet':[
								{'x': 12, 'y': 84}, {'x': 60, 'y': 80}
							]
				},
				{
					'name': 'sPGA 0 lub 1',
					'labelsPos': 'right',
					'color': '#c2cd23',
					'dataSet': [
									{'x': 0, 'y': 0}, {'x': 4, 'y': 44}, {'x': 8, 'y': 64}, 
									{'x': 12, 'y': 75}, {'x': 16, 'y': 84}, {'x': 20, 'y': 83}, 
									{'x': 24, 'y': 81}, {'x': 28, 'y': 80}, {'x': 32, 'y': 80}, 
									{'x': 36, 'y': 81}, {'x': 40, 'y': 79}, {'x': 44, 'y': 77}, 
									{'x': 48, 'y': 75}, {'x': 52, 'y': 75}, {'x': 55, 'y': 76},
									{'x': 60, 'y': 73},
							],
					'pointSet':[
								{'x': 12, 'y': 75}, {'x': 60, 'y': 73}
							]
				},
				{
					'name': 'PASI 90',
					'labelsPos': 'right-bottom',
					'color': '#49aa42',
					'dataSet': [
									{'x': 0, 'y': 0}, {'x': 4, 'y': 24}, {'x': 8, 'y': 54}, 
									{'x': 12, 'y': 65}, {'x': 16, 'y': 73}, {'x': 20, 'y': 74}, 
									{'x': 24, 'y': 77}, {'x': 28, 'y': 76}, {'x': 32, 'y': 77}, 
									{'x': 36, 'y': 76}, {'x': 40, 'y': 76}, {'x': 44, 'y': 74}, 
									{'x': 48, 'y': 73}, {'x': 52, 'y': 73}, {'x': 60, 'y': 71},
							],
					'pointSet':[
								{'x': 12, 'y': 65}, {'x': 60, 'y': 71}
							]
				},
				{
					'name': 'PASI 100',
					'labelsPos': 'right',
					'color': '#006225',
					'dataSet': [
									{'x': 0, 'y': 0}, {'x': 4, 'y': 10}, {'x': 8, 'y': 25}, 
									{'x': 12, 'y': 35}, {'x': 16, 'y': 44}, {'x': 20, 'y': 50}, 
									{'x': 24, 'y': 52}, {'x': 28, 'y': 53}, {'x': 32, 'y': 53}, 
									{'x': 36, 'y': 54}, {'x': 40, 'y': 54}, {'x': 44, 'y': 52}, 
									{'x': 48, 'y': 52}, {'x': 52, 'y': 51}, {'x': 55, 'y': 52},
									{'x': 60, 'y': 52},
							],
					'pointSet':[
								{'x': 12, 'y': 35}, {'x': 60, 'y': 52}
							]
				}
			];

		var dataChart_2_1 = [
				{
					'name': 'PASI 75',
					'labelsPos': 'top',
					'color': '#a2cc95',
					'dataSet': [
								{'x': 0, 'y': 0}, {'x': 1, 'y': 0}, {'x': 2, 'y': 18}, 
								{'x': 4, 'y': 50}, {'x': 8, 'y': 81}, {'x': 12, 'y': 90}
							],
					'pointSet':[
								{'x': 0, 'y': 0}, {'x': 1, 'y': 0}, {'x': 2, 'y': 18}, 
								{'x': 4, 'y': 50}, {'x': 8, 'y': 81}, {'x': 12, 'y': 90}
							]
				},
				{
					'name': 'sPGA 0 lub 1',
					'labelsPos': 'right-bottom',
					'color': '#c2cd23',
					'dataSet': [
								{'x': 0, 'y': 0}, {'x': 1, 'y': 4}, {'x': 2, 'y': 18}, 
								{'x': 4, 'y': 49}, {'x': 8, 'y': 72}, {'x': 12, 'y': 78}
							],
					'pointSet':[
								{'x': 0, 'y': 0}, {'x': 1, 'y': 4}, {'x': 2, 'y': 18}, 
								{'x': 4, 'y': 49}, {'x': 8, 'y': 72}, {'x': 12, 'y': 78}
							]
				},
				{
					'name': 'PASI 90',
					'labelsPos': 'right-bottom',
					'color': '#49aa42',
					'dataSet': [
								{'x': 0, 'y': 0}, {'x': 1, 'y': 0}, {'x': 2, 'y': 1}, 
								{'x': 4, 'y': 8}, {'x': 8, 'y': 27}, {'x': 12, 'y': 42}
							],
					'pointSet':[
								{'x': 0, 'y': 0}, {'x': 1, 'y': 0}, {'x': 2, 'y': 1}, 
								{'x': 4, 'y': 8}, {'x': 8, 'y': 27}, {'x': 12, 'y': 42}
							]
				},
				{
					'name': 'PASI 100',
					'labelsPos': 'top',
					'color': '#006225',
					'dataSet': [
								{'x': 0, 'y': 0}, {'x': 1, 'y': 0}, {'x': 2, 'y': 1}, 
								{'x': 4, 'y': 1}, {'x': 8, 'y': 1}, {'x': 12, 'y': 2}
							],
					'pointSet':[
								{'x': 0, 'y': 0}, {'x': 1, 'y': 0}, {'x': 2, 'y': 1}, 
								{'x': 4, 'y': 1}, {'x': 8, 'y': 1}, {'x': 12, 'y': 2}
							]
				}
			];

		var dataChart_2_2 = [
				{
					'name': 'PASI 75',
					'labelsPos': 'top',
					'color': '#a2cc95',
					'dataSet': [
								{'x': 0, 'y': 0}, {'x': 1, 'y': 5}, {'x': 2, 'y': 23}, 
								{'x': 4, 'y': 54}, {'x': 8, 'y': 81}, {'x': 12, 'y': 87}
							],
					'pointSet':[
								{'x': 0, 'y': 0}, {'x': 1, 'y': 5}, {'x': 2, 'y': 23}, 
								{'x': 4, 'y': 54}, {'x': 8, 'y': 81}, {'x': 12, 'y': 87}
							]
				},
				{
					'name': 'sPGA 0 lub 1',
					'labelsPos': 'right-bottom',
					'color': '#c2cd23',
					'dataSet': [
								{'x': 0, 'y': 0}, {'x': 1, 'y': 2}, {'x': 2, 'y': 22}, 
								{'x': 4, 'y': 53}, {'x': 8, 'y': 77}, {'x': 12, 'y': 84}
							],
					'pointSet':[
								{'x': 0, 'y': 0}, {'x': 1, 'y': 2}, {'x': 2, 'y': 22}, 
								{'x': 4, 'y': 53}, {'x': 8, 'y': 77}, {'x': 12, 'y': 84}
							]
				},
				{
					'name': 'PASI 90',
					'labelsPos': 'right-bottom',
					'color': '#49aa42',
					'dataSet': [
								{'x': 0, 'y': 0}, {'x': 1, 'y': 0}, {'x': 2, 'y': 1}, 
								{'x': 4, 'y': 12}, {'x': 8, 'y': 36}, {'x': 12, 'y': 53}
							],
					'pointSet':[
								{'x': 0, 'y': 0}, {'x': 1, 'y': 0}, {'x': 2, 'y': 1}, 
								{'x': 4, 'y': 12}, {'x': 8, 'y': 36}, {'x': 12, 'y': 53}
							]
				},
				{
					'name': 'PASI 100',
					'labelsPos': 'top',
					'color': '#006225',
					'dataSet': [
								{'x': 0, 'y': 0}, {'x': 1, 'y': 0}, {'x': 2, 'y': 1}, 
								{'x': 4, 'y': 3}, {'x': 8, 'y': 5}, {'x': 12, 'y': 7}
							],
					'pointSet':[
								{'x': 0, 'y': 0}, {'x': 1, 'y': 0}, {'x': 2, 'y': 1}, 
								{'x': 4, 'y': 3}, {'x': 8, 'y': 5}, {'x': 12, 'y': 7}
							]
				}
			];
	// ========================================================================


	buildChart('#chart', dataChart_1_1);
	// buildChart('#chart', dataChart_1_2);
	// buildChart('#chart', dataChart_1_3);

	buildChart('#chart', dataChart_2_1, {
		svgAxis: {xRange:[0, 12], yRange:[0, 100], xLabel: 'WEEK', yLabel: 'PERCENT', labelColor: '#666', fontSize: 16},
	});
	// buildChart('#chart', dataChart_2_2, {
	// 	svgAxis: {xRange:[0, 12], yRange:[0, 100], xLabel: 'WEEK', yLabel: 'PERCENT', labelColor: '#666', fontSize: 16},
	// });


}











