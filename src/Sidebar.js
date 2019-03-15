import React from "react";
import { CheckboxGroup } from "@newamerica/components";
import slugify from "./lib/slugify";
import { group } from "d3-array";

export default class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { expanded: false };
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
    this.handleChange = this.handleChange.bind(this);
  }

  expandSidebar = e => {
    const { expanded } = this.state;
    this.setState({ expanded: !expanded });
  };

  handleChange = (map, id, filterState) => {
    const obj = {};
    Object.keys(filterState).forEach(key => {
      obj[map.get(key)[0].label] = filterState[key];
    });
    this.props.onFilterChange(id, obj);
  };

  render() {
    const { expanded } = this.state;
    return (
      <div className={`dv-Sidebar${expanded ? " expanded" : ""}`}>
        <button className="dv-Sidebar__button" onClick={this.expandSidebar}>
          Filters
        </button>
        <div className="dv-Sidebar__interior">
          <div>
            <CheckboxGroup
              title="Operating Region"
              style={{ paddingBottom: "1rem", borderBottom: "solid 1px #ddd" }}
              options={this.regionFilters}
              onChange={filterState =>
                this.handleChange(
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
                this.handleChange(
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
                this.handleChange(this.sdgMap, "SDG", filterState)
              }
              selectButtons={true}
            />
          </div>
        </div>
      </div>
    );
  }
}
