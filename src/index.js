import React from "react";
import ReactDOM from "react-dom";
import Dashboard from "./Dashboard";
import "./index.scss";

let queue = [];
let data = null;

const settings = {
  dashboard: el => {
    // console.log(create_csv(data.table));
    ReactDOM.render(
      [
        <Dashboard
          tableData={data.table}
          popupData={data.popup}
          filters={data.filters}
        />,
        <div id="download_file">
          <span onClick={() => create_csv(data.table)}>
            Download Data File CSV
          </span>
        </div>
      ],
      el
    );
  }
};

fetch("https://na-data-projects.s3.amazonaws.com/data/bta/impact_ledger.json")
  .then(response => response.json())
  .then(_data => {
    data = _data;
    for (let i = 0; i < queue.length; i++) queue[i]();
  });

window.renderDataViz = function(el) {
  let id = el.getAttribute("id");
  let chart = settings[id];
  if (!chart) return;

  if (data) {
    chart(el);
  } else {
    queue.push(() => chart(el));
  }
};

function create_csv(input) {
  let keys = Object.keys(input[0]);
  let csv = "";
  csv += keys.join(",") + "\r\n";
  // console.log(keys);
  input.forEach(function(rowObj) {
    let row = Object.values(rowObj)
      .map(s => {
        return s ? s.replace(/,/g, ";").replace(/\n/g, " ") : s;
      })
      .join(",");
    csv += row + "\r\n";
  });
  let filename = "impact_ledger_data.csv";
  let blob = new Blob([csv], { type: "text/csv" });
  let download_link = document.createElement("a");
  download_link.download = `${filename}`;
  download_link.href = URL.createObjectURL(blob);
  document.body.appendChild(download_link);
  download_link.click();
}
