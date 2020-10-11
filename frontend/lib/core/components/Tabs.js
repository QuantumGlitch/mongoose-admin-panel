import React, { useState, useLayoutEffect } from 'react';
import { Row, Col, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
export default function Tabs({
  children,
  tabs
}) {
  // Take as default the first visible tab
  const [activeTab, setActiveTab] = useState(tabs.findIndex(t => t.visible));
  /* 
    If the activeTab is no longer visible
    we need to update to a new one visible
  */

  useLayoutEffect(() => {
    if (!tabs[activeTab].visible) setActiveTab(tabs.findIndex(t => t.visible));
  }, [tabs[activeTab].visible]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Nav, {
    tabs: true
  }, tabs.map(({
    title,
    visible
  }, tabIndex) => visible && /*#__PURE__*/React.createElement(NavItem, {
    key: tabIndex
  }, /*#__PURE__*/React.createElement(NavLink, {
    href: "#",
    className: activeTab == tabIndex ? 'active' : '',
    onClick: () => setActiveTab(tabIndex)
  }, title)))), /*#__PURE__*/React.createElement(TabContent, {
    activeTab: activeTab
  }, tabs.map(({
    refs,
    visible
  }, tabIndex) => visible && /*#__PURE__*/React.createElement(TabPane, {
    key: tabIndex,
    tabId: tabIndex
  }, /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement(Col, {
    sm: "12"
  }, children.filter(c => c && refs.find(r => c.props.id === r))))))));
}