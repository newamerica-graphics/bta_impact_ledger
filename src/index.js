import React from "react";
import ReactDOM from "react-dom";
import Dashboard from "./Dashboard";
import "./index.scss";

let queue = [];
let data = null;

const settings = {
  dashboard: el => {
    ReactDOM.render(
      [
        <Dashboard
          data={data.modal}
          meta={data.meta}
          filters={data.filters}
        />,
        <div id="download_file">
          <span onClick={() => create_csv(
            data.modal.slice(data.meta[0].number_meta_rows),
            Object.keys(data.modal[data.meta[0].csv_row])
              .filter(d => data.modal[data.meta[0].csv_row][d] === "TRUE")
          )}>
            Download Data File CSV
          </span>
        </div>
      ],
      el
    );
  }
};

fetch("https://na-data-sheetsstorm.s3.us-west-2.amazonaws.com/prod/bta/impact_ledger.json")
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

function create_csv(input, keys) {
  let csv = "";
  csv += keys.join(",") + "\r\n";
  input.forEach(function(rowObj) {
    let row = keys
      .map(s => {
        return rowObj[s] ? rowObj[s].replace(/,/g, ";").replace(/\n/g, " ") : rowObj[s];
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
