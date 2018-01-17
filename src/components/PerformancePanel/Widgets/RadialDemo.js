/*
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Created by joey on 17/1/18.
 */

//based on https://bl.ocks.org/mbostock/1096355
//apple design:https://images.apple.com/watch/features/images/fitness_large.jpg
"use strict";

(function(){
  var gap = 2;

  var ranDataset = function () {
    var ran = Math.random();

    return    [
      {index: 0, name: 'move', icon: "\uF105", percentage: ran * 60 + 30},
      {index: 1, name: 'exercise', icon: "\uF101", percentage: ran * 60 + 30},
      {index: 2, name: 'stand', icon: "\uF106", percentage: ran * 60 + 30}
    ];

  };

  var ranDataset2 = function () {
    var ran = Math.random();

    return    [
      {index: 0, name: 'move', icon: "\uF105", percentage: ran * 60 + 30}
    ];

  };
  var colors = ["#e90b3a", "#a0ff03", "#1ad5de"];
  var width = 500,
    height = 500,
    τ = 2 * Math.PI;

  function build(dataset,singleArcView){

    var arc = d3.svg.arc()
      .startAngle(0)
      .endAngle(function (d) {
        return d.percentage / 100 * τ;
      })
      .innerRadius(function (d) {
        return 140 - d.index * (40 + gap)
      })
      .outerRadius(function (d) {
        return 180 - d.index * (40 + gap)
      })
      .cornerRadius(20);//modified d3 api only

    var background = d3.svg.arc()
      .startAngle(0)
      .endAngle(τ)
      .innerRadius(function (d, i) {
        return 140 - d.index * (40 + gap)
      })
      .outerRadius(function (d, i) {
        return 180 - d.index * (40 + gap)
      });

    var svg = d3.select(".readial-main").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    //add linear gradient, notice apple uses gradient alone the arc..
    //meh, close enough...


    var gradient = svg.append("svg:defs")
      .append("svg:linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "50%")
      .attr("y2", "0%")
      .attr("spreadMethod", "pad");

    gradient.append("svg:stop")
      .attr("offset", "0%")
      .attr("stop-color", "#fe08b5")
      .attr("stop-opacity", 1);

    gradient.append("svg:stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ff1410")
      .attr("stop-opacity", 1);


    //add some shadows
    var defs = svg.append("defs");

    var filter = defs.append("filter")
      .attr("id", "dropshadow")

    filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 4)
      .attr("result", "blur");
    filter.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 1)
      .attr("dy", 1)
      .attr("result", "offsetBlur");

    var feMerge = filter.append("feMerge");

    feMerge.append("feMergeNode")
      .attr("in", "offsetBlur");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");

    var field = svg.selectAll("g")
      .data(dataset)
      .enter().append("g");

    field.append("path").attr("class", "progress").attr("filter", "url(#dropshadow)");

    field.append("path").attr("class", "bg")
      .style("fill", function (d) {
        return colors[d.index];
      })
      .style("opacity", 0.2)
      .attr("d", background);

    field.append("text").attr('class','icon');


    if(singleArcView){

      field.append("text").attr('class','goal').text("OF 600 CALS").attr("transform","translate(0,50)");
      field.append("text").attr('class','completed').attr("transform","translate(0,0)");

    }

    d3.transition().duration(1750).each(update);

    function update() {
      field = field
        .each(function (d) {
          this._value = d.percentage;
        })
        .data(dataset)
        .each(function (d) {
          d.previousValue = this._value;
        });

      field.select("path.progress").transition().duration(1750).delay(function (d, i) {
        return i * 200
      })
        .ease("elastic")
        .attrTween("d", arcTween)
        .style("fill", function (d) {
          if(d.index===0){
            return "url(#gradient)"
          }
          return colors[d.index];
        });

      field.select("text.icon").text(function (d) {
        return d.icon;
      }).attr("transform", function (d) {
        return "translate(10," + -(150 - d.index * (40 + gap)) + ")"

      });

      field.select("text.completed").text(function (d) {
        return Math.round(d.percentage /100 * 600);
      });

      setTimeout(update, 2000);

    }

    function arcTween(d) {
      var i = d3.interpolateNumber(d.previousValue, d.percentage);
      return function (t) {
        d.percentage = i(t);
        return arc(d);
      };
    }


  }


  build(ranDataset);
  build(ranDataset2,true);


})()


