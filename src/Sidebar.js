import React from "react";
import { CheckboxGroup } from "@newamerica/components";
import slugify from "./lib/slugify";
import { group } from "d3-array";

export default class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.regionFilters = Object.keys(this.props.regionFilters).map(d => ({
      id: slugify(d),
      label: d,
      checked: true
    }));
    this.scaleFilters = Object.keys(this.props.scaleFilters).map(d => ({
      id: slugify(d),
      label: d,
      checked: true
    }));
    this.sdgFilters = Object.keys(this.props.sdgFilters).map(d => ({
      id: slugify(d),
      label: d,
      checked: true
    }));
    this.regionMap = group(this.regionFilters, d => d.id);
    this.scaleMap = group(this.scaleFilters, d => d.id);
    this.sdgMap = group(this.sdgFilters, d => d.id);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleSidebarExpand = this.handleSidebarExpand.bind(this);
  }

  handleSidebarExpand = (e) => {
    this.props.onSidebarExpand(e);
  }

  handleFilterChange = (map, id, filterState) => {
    const obj = {};
    Object.keys(filterState).forEach(key => {
      obj[map.get(key)[0].label] = filterState[key];
    });
    this.props.onFilterChange(id, obj);
  };

  render() {
    const expandSidebar = this.props.expandSidebar;
    return (
      <div className={`dv-Sidebar${expandSidebar ? " expanded" : ""}`}>
        <button className="dv-Sidebar__button" onClick={this.handleSidebarExpand}>
          Filters
        </button>
        <div className="dv-Sidebar__interior">
          <div>
            <CheckboxGroup
              title="Operating Region"
              style={{ paddingBottom: "1rem", borderBottom: "solid 1px #ddd" }}
              options={this.regionFilters}
              onChange={filterState =>
                this.handleFilterChange(
                  this.regionMap,
                  "Operating Region",
                  filterState
                )
              }
              selectButtons={true}
            />
            <CheckboxGroup
              title="Current Scale (People Served)"
              style={{ padding: "1rem 0", borderBottom: "solid 1px #ddd" }}
              options={this.scaleFilters}
              onChange={filterState =>
                this.handleFilterChange(
                  this.scaleMap,
                  "Current Scale (People Served)",
                  filterState
                )
              }
              selectButtons={true}
            />
            <CheckboxGroup
              title="SDG"
              style={{ paddingTop: "1rem" }}
              options={this.sdgFilters}
              onChange={filterState =>
                this.handleFilterChange(this.sdgMap, "SDG", filterState)
              }
              selectButtons={true}
            />
          </div>
        </div>
      </div>
    );
  }
}
