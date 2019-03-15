import React from "react";
import { ChartContainer, Title } from "@newamerica/meta";
import Sidebar from "./Sidebar";
import { DataTableWithSearch } from "@newamerica/data-table";
import { ModalIcon, X } from "./lib/Icons";
import ReactModal from "react-modal";
import { group } from "d3-array";

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
        headerClassName: "not-sortable",
        sortable: false,
        minWidth: 50,
        Cell: ({ value }) => (
          <button
            onClick={e => this.handleOpenModal(value)}
            className="dv-Dashboard__button"
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
            : d === "Description"
            ? {
                Header: d,
                accessor: d,
                minWidth: 245
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
    let data = this.props.tableData
      .filter(val => {
        const scale = val["Current Scale (People Served)"];
        if (!scale || scaleFilters[scale]) {
          return true;
        } else {
          return false;
        }
      })
      .filter(val => {
        const region = val["Operating Region"];
        if (
          !region ||
          Object.keys(regionFilters).some(
            key => regionFilters[key] && region.includes(key)
          )
        ) {
          return true;
        } else {
          return false;
        }
      })
      .filter(val => {
        const sdg = val["SDG"];
        if (
          !sdg ||
          Object.keys(sdgFilters).some(
            key => sdgFilters[key] && sdg.includes(key)
          )
        ) {
          return true;
        } else {
          return false;
        }
      });
    return (
      <ChartContainer>
        <div className="dv-Dashboard__content">
          <Title style={{ padding: "0" }}>This is a title</Title>
          <Sidebar
            onFilterChange={this.onFilterChange}
            scaleFilters={scaleFilters}
            regionFilters={regionFilters}
            sdgFilters={sdgFilters}
          />
          <DataTableWithSearch
            columns={this.columns}
            data={data}
            defaultPageSize={10}
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
            <button
              onClick={this.handleCloseModal}
              className="dv-Dashboard__button dv-Dashboard__button-close"
              aria-label="Close modal"
            >
              <X />
            </button>
          </ReactModal>
        </div>
      </ChartContainer>
    );
  }
}
