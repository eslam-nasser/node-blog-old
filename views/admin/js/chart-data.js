// var randomScalingFactor = function(){ return Math.round(Math.random()*1000)};
	
// 	var lineChartData = {
// 			labels : ["January","February","March","April","May","June","July"],
// 			datasets : [
// 				{
// 					label: "My First dataset",
// 					fillColor : "rgba(220,220,220,0.2)",
// 					strokeColor : "rgba(220,220,220,1)",
// 					pointColor : "rgba(220,220,220,1)",
// 					pointStrokeColor : "#fff",
// 					pointHighlightFill : "#fff",
// 					pointHighlightStroke : "rgba(220,220,220,1)",
// 					data : [randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
// 				},
// 				{
// 					label: "My Second dataset",
// 					fillColor : "rgba(48, 164, 255, 0.2)",
// 					strokeColor : "rgba(48, 164, 255, 1)",
// 					pointColor : "rgba(48, 164, 255, 1)",
// 					pointStrokeColor : "#fff",
// 					pointHighlightFill : "#fff",
// 					pointHighlightStroke : "rgba(48, 164, 255, 1)",
// 					data : [randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
// 				}
// 			]

// 		}
		
// 	var barChartData = {
// 			labels : ["January","February","March","April","May","June","July"],
// 			datasets : [
// 				{
// 					fillColor : "rgba(220,220,220,0.5)",
// 					strokeColor : "rgba(220,220,220,0.8)",
// 					highlightFill: "rgba(220,220,220,0.75)",
// 					highlightStroke: "rgba(220,220,220,1)",
// 					data : [randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
// 				},
// 				{
// 					fillColor : "rgba(48, 164, 255, 0.2)",
// 					strokeColor : "rgba(48, 164, 255, 0.8)",
// 					highlightFill : "rgba(48, 164, 255, 0.75)",
// 					highlightStroke : "rgba(48, 164, 255, 1)",
// 					data : [randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
// 				}
// 			]
	
// 		}

// window.onload = function(){
// 	var chart1 = document.getElementById("line-chart").getContext("2d");
// 	window.myLine = new Chart(chart1).Line(lineChartData, {
// 		responsive: true
// 	});
// 	var chart2 = document.getElementById("bar-chart").getContext("2d");
// 	window.myBar = new Chart(chart2).Bar(barChartData, {
// 		responsive : true
// 	});	
// };