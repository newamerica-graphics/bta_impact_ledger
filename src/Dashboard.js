import React from "react";
import { ChartContainer, Title } from "@newamerica/meta";
import Sidebar from "./Sidebar";
import { DataTableWithSearch } from "@newamerica/data-table";
import { X } from "./lib/Icons";
import ReactMarkdown from "react-markdown";
import ReactModal from "react-modal";
import { group } from "d3-array";

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    ReactModal.setAppElement("body");

    this.meta = this.props.meta[0];
    this.data = this.props.data.slice(this.meta.number_meta_rows);

    this.filterKeys = row => Object.keys(this.props.data[row])
      .filter(d => this.props.data[row][d] === "TRUE");

    this.modalDataMap = group(this.data, d => d.id);

    this.state = {
      showModal: !!window.location.hash,
      modalContents: window.location.hash ? this.modalDataMap.get(window.location.hash.slice(1))[0] : null,
      expandSidebar: false
    };

    Object.keys(this.props.filters[0]).forEach(name => {
      this.state[name] = this.props.filters.reduce((acc, cur) => {
        if (cur[name]) {
          acc[cur[name]] = true;
        }
        return acc;
      }, {});
    });

    this.tableColumns = [
      ...this.filterKeys(this.meta.table_row)
        .map(d =>
          d === "Project"
          ? {
            Header: d,
            accessor: d,
            minWidth: 180,
            Cell: row => {
              const id = row.original["id"];
              if (id) {
                return (
                  <div>
                    <ReactMarkdown
                      source={row.value}
                      className="dv-ReactMarkdown"
                      linkTarget="_blank"
                    />
                    <button
                      onClick={e => this.handleOpenModal(id)}
                      className="dv-Dashboard__button dv-Dashboard__button--open-modal"
                    >
                      Read more
                    </button>
                  </div>
                );
              } else {
                return row.value;
              }
            }
          }
          : {
            Header: d,
            accessor: d,
            minWidth: d === "Description" ? 245 : 150,
            Cell: row => (
              <ReactMarkdown
                source={row.value}
                className="dv-ReactMarkdown"
                linkTarget="_blank"
              />
            )
          }
        )
    ];

    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.handleSidebarExpand = this.handleSidebarExpand.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
  }

  onFilterChange = (name, filter) => {
    this.setState({ [name]: filter });
  };

  handleSidebarExpand = (e) => {
    const { expandSidebar } = this.state;
    this.setState({ expandSidebar: !expandSidebar });
  };

  handleOpenModal = id => {
    window.location.hash = id;
    this.setState({ showModal: true, modalContents: this.modalDataMap.get(window.location.hash.slice(1))[0] });
  };
  handleCloseModal() {
    window.location.hash = "";
    this.setState({ showModal: false });
  };

  render() {
    const regionFilters = this.state["Operating Region"];
    const scaleFilters = this.state["Current Scale (People Served)"];
    const sdgFilters = this.state["SDG"];
    const { showModal, modalContents, expandSidebar } = this.state;
    let tableData = this.data
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
      <div>
      <ChartContainer>
        <div className="dv-Dashboard__content">
          <h1>Blockchain Impact Ledger</h1>
        </div>
      </ChartContainer>
      <ChartContainer>
        <Sidebar
          onFilterChange={this.onFilterChange}
          scaleFilters={scaleFilters}
          regionFilters={regionFilters}
          sdgFilters={sdgFilters}
          expandSidebar={expandSidebar}
          onSidebarExpand={this.handleSidebarExpand}
        />
        <div className="dv-Dashboard__content">
          <button
            className="dv-Dashboard__button dv-Dashboard__button--toggle-filters"
            onClick={this.handleSidebarExpand}
          >
            Filter results
          </button>
          <DataTableWithSearch
            columns={this.tableColumns}
            data={tableData}
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
            <button
              onClick={this.handleCloseModal}
              className="dv-Dashboard__button dv-Dashboard__button--close-modal"
              aria-label="Close modal"
            >
              <X />
            </button>
            {modalContents &&
              <div className="dv-Modal__contents">
                <div className="dv-Modal__header">
                  <hgroup>
                    <h3>
                      {modalContents["Organization"]}
                    </h3>
                    <h2>
                      <ReactMarkdown
                        source={modalContents["Project--modal"]}
                        className="dv-ReactMarkdown"
                        linkTarget="_blank"
                      />
                    </h2>
                  </hgroup>
                  <p>
                    <ReactMarkdown
                      source={modalContents["Description"]}
                      className="dv-ReactMarkdown"
                      linkTarget="_blank"
                    />
                  </p>

                  <h3 className="dv-Modal__key">Objective</h3>
                  <ReactMarkdown
                    source={modalContents["Objective"]}
                    className="dv-ReactMarkdown"
                    linkTarget="_blank"
                  />
                </div>

                <div className="dv-Modal__items">
                  {this.filterKeys(this.meta.modal_row).slice(4).map(
                    key =>
                      key !== "id" &&
                      modalContents[key] && (
                        <div className="dv-Modal__item">
                          <h3 className="dv-Modal__key">{key}</h3>
                          <ReactMarkdown
                            source={modalContents[key]}
                            className="dv-ReactMarkdown"
                            linkTarget="_blank"
                          />
                        </div>
                      )
                  )}
                </div>
              </div>
            }
          </ReactModal>
        </div>
      </ChartContainer>
      </div>
    );
  }
}
