import React from "react";
import { ChartContainer, Title } from "@newamerica/meta";
import Sidebar from "./Sidebar";
import { DataTableWithSearch } from "@newamerica/data-table";
import ModalIcon from "./lib/ModalIcon";
import ReactModal from "react-modal";
import { group } from "d3-array";

function filter(num, str) {
  switch (str) {
    case "<1000":
      return num < 1000;
    case "1000 - 10000":
      return num >= 1000 && num <= 10000;
    case "10000 - 100000":
      return num >= 10000 && num <= 100000;
    case ">100000":
      return num > 100000;
  }
}

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    ReactModal.setAppElement("body");
    this.state = {
      showModal: false
    };
    Object.keys(this.props.filters[0]).forEach(name => {
      this.state[name] = this.props.filters.reduce((acc, cur) => {
        if (cur[name]) {
          acc[cur[name]] = true;
        }
        return acc;
      }, {});
    });
    this.columns = [
      {
        Header: "",
        accessor: "id",
        className: "dv-Dashboard__icon",
        Cell: ({ value }) => (
          <button
            onClick={e => this.handleOpenModal(value)}
            className="dv-Dashboard__modal-trigger"
          >
            <ModalIcon />
          </button>
        )
      },
      ...Object.keys(this.props.tableData[0])
        .filter(d => d !== "id" && d !== "Link")
        .map(d =>
          d === "Project"
            ? {
                Header: d,
                accessor: d,
                minWidth: 150,
                Cell: row => {
                  const link = row.original["Link"];
                  if (link) {
                    return (
                      <a target="_blank" rel="noopener noreferrer" href={link}>
                        {row.value}
                      </a>
                    );
                  } else {
                    return row.value;
                  }
                }
              }
            : {
                Header: d,
                accessor: d,
                minWidth: 150
              }
        )
    ];
    this.dataMap = group(this.props.popupData, d => d.id);
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
  }

  onFilterChange = (name, filter) => {
    console.log(name, filter);
    this.setState({ [name]: filter });
  };

  handleOpenModal = id => {
    this.setState({ showModal: true, modalContents: this.dataMap.get(id)[0] });
  };
  handleCloseModal = id => {
    this.setState({ showModal: false });
  };

  render() {
    const regionFilters = this.state["Operating Region"];
    const scaleFilters = this.state["Current Scale (People Served)"];
    const sdgFilters = this.state["SDG"];
    const { showModal, modalContents } = this.state;
    let data = this.props.tableData.filter(val => {
      const num = +val["sample_number"];
      if (!num) {
        return true;
      }
      const activeScaleFilters = Object.keys(scaleFilters).filter(
        f => scaleFilters[f]
      );
      return activeScaleFilters.every(f => filter(num, f));
    });
    return (
      <ChartContainer>
        <div className="dv-Dashboard__content">
          <DataTableWithSearch
            columns={this.columns}
            data={data}
            defaultPageSize={20}
          />
          <ReactModal
            isOpen={showModal}
            contentLabel="Read More"
            htmlOpenClassName="ReactModal__Html--open"
            onRequestClose={this.handleCloseModal}
            className="dv-Modal"
            overlayClassName="dv-Modal__overlay"
          >
            <div className="dv-Modal__contents">
              {modalContents &&
                Object.keys(modalContents).map(
                  key =>
                    key !== "id" &&
                    modalContents[key] && (
                      <div className="dv-Modal__item">
                        <span className="dv-Modal__key">{key}</span>
                        <span className="dv-Modal__value">
                          {modalContents[key]}
                        </span>
                      </div>
                    )
                )}
            </div>
            <button onClick={this.handleCloseModal}>Close Modal</button>
          </ReactModal>
        </div>
      </ChartContainer>
    );
  }
}
