// React
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// D3
import { select } from "d3-selection";
import { scaleLinear, scalePoint, scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import { max, min } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { format } from "d3-format";

// CSS Module
import styles from "./ScatterPlot.module.css";

export function ScatterPlot({ trees }) {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const navigate = useNavigate();

  const [hoveredTree, setHoveredTree] = useState(null);

  const handlePointClick = (treeId) => {
    navigate(`/tree/${treeId}`);
  };

  const handlePointMouseOver = (treeData) => {
    setHoveredTree(treeData);
  };

  const handlePointMouseOut = () => {
    setHoveredTree(null);
  };

  // Excluded keys
  const excludedKeys = [
    "note",
    "tree_images",
    "tree_data",
    "harvests",
    "flower_thinnings",
    "fruit_thinnings",
    "sprayings",
    "id",
  ];

  const formatKey = (key) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // No trees
  useEffect(() => {
    if (!trees || trees.length === 0) {
      select(svgRef.current).selectAll("*").remove();
      setHoveredTree(null);
      return;
    }

    const yDomain = Array.from(
      new Set(trees.map((d) => `Number ${d.number}, Field ${d.field}`))
    ).sort((a, b) => {
      const [numA, fieldA] = a
        .replace("Number ", "")
        .replace("Field ", "")
        .split(", ")
        .map(Number);
      const [numB, fieldB] = b
        .replace("Number ", "")
        .replace("Field ", "")
        .split(", ")
        .map(Number);
      if (numA !== numB) return numA - numB;
      return fieldB - fieldA;
    });

    // Setup
    const containerWidth = 800;
    const baseHeightPerCategory = 35;
    const minPlotHeight = 400;
    const dynamicPlotHeight = yDomain.length * baseHeightPerCategory;
    const actualPlotHeight = Math.max(minPlotHeight, dynamicPlotHeight);

    const margin = { top: 40, right: 60, bottom: 80, left: 120 };
    const innerWidth = containerWidth - margin.left - margin.right;
    const innerHeight = actualPlotHeight - margin.top - margin.bottom;

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", containerWidth)
      .attr("height", actualPlotHeight)
      .attr("viewBox", `0 0 ${containerWidth} ${actualPlotHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // X-axis (Rows)
    const minRow = min(trees, (d) => d.row);
    const maxRow = max(trees, (d) => d.row);
    const xRange = maxRow - minRow;
    const xPadding = xRange > 0 ? xRange * 0.15 : 0.5;

    const xScale = scaleLinear()
      .domain([minRow - xPadding, maxRow + xPadding])
      .range([0, innerWidth]);

    const uniqueRowNumbers = Array.from(new Set(trees.map((d) => d.row))).sort(
      (a, b) => a - b
    );
    const xAxis = axisBottom(xScale)
      .tickValues(uniqueRowNumbers)
      .tickFormat(format("d"));

    g.append("g")
      .attr("class", "x-axis axis")
      .call(xAxis)
      .attr("transform", `translate(0, ${innerHeight})`);

    g.append("text")
      .attr("class", styles.axisLabel)
      .attr("text-anchor", "middle")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + margin.bottom / 1.5)
      .text("Row");

    // Y-axis (Numbers and Fields)
    const yScale = scalePoint()
      .domain(yDomain)
      .range([innerHeight, 0])
      .padding(0.5);

    const yAxis = axisLeft(yScale);

    g.append("g").attr("class", "y-axis axis").call(yAxis);

    g.append("text")
      .attr("class", styles.axisLabel)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left * 0.9)
      .attr("x", -innerHeight / 2)
      .text("Number, Field");

    // Color Scale
    const uniqueNumbers = Array.from(new Set(trees.map((d) => d.number)));
    const colorScale = scaleOrdinal(schemeCategory10).domain(uniqueNumbers);

    // Tooltip
    const tooltip = select(tooltipRef.current);

    // Data Points
    g.selectAll("circle")
      .data(trees)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.row))
      .attr("cy", (d) => yScale(`Number ${d.number}, Field ${d.field}`))
      .attr("r", 6)
      .attr("fill", (d) => colorScale(d.number))
      .attr("opacity", 0.8)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        tooltip
          .style("opacity", 1)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`).html(`
            <span class="${styles.greenText}">Tree ID:</span> ${d.id}<br>
            <span class="${styles.greenText}">Row:</span> ${d.row}<br>
            <span class="${styles.greenText}">Number:</span> ${d.number}<br>
            <span class="${styles.greenText}">Field:</span> ${d.field}
          `);
        handlePointMouseOver(d);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`);
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
        handlePointMouseOut();
      })
      .on("click", (_, d) => handlePointClick(d.id));
  }, [trees, navigate]);

  return (
    <div className={styles.scatterPlotContainerWrapper}>
      <svg ref={svgRef} className={styles.scatterPlotSvg}></svg>
      <div ref={tooltipRef} className={styles.tooltip}></div>

      <div className={styles.hoverInfoPanel}>
        {hoveredTree ? (
          <>
            <h3>Tree Details</h3>
            <p key="id" className={styles.detailRow}>
              <strong>Tree ID:</strong> <span>{String(hoveredTree.id)}</span>{" "}
            </p>
            {Object.keys(hoveredTree).map((key) => {
              if (excludedKeys.includes(key)) {
                return null;
              }

              const value = hoveredTree[key];

              if (
                (typeof value !== "string" &&
                  typeof value !== "number" &&
                  typeof value !== "boolean") ||
                String(value).trim() === "" ||
                value === null ||
                value === undefined
              ) {
                return null;
              }

              return (
                <p key={key} className={styles.detailRow}>
                  <strong>{formatKey(key)}:</strong>{" "}
                  <span>{String(value)}</span>{" "}
                </p>
              );
            })}
          </>
        ) : (
          <p className={styles.noHoverMessage}>
            Hover over a tree point to see details.
          </p>
        )}
      </div>
    </div>
  );
}
