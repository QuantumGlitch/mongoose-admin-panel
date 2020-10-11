import React, { useState, useLayoutEffect } from 'react';

import { Row, Col, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';

export default function Tabs({ children, tabs }) {
  // Take as default the first visible tab
  const [activeTab, setActiveTab] = useState(tabs.findIndex((t) => t.visible));

  /* 
    If the activeTab is no longer visible
    we need to update to a new one visible
  */
  useLayoutEffect(() => {
    if (!tabs[activeTab].visible) setActiveTab(tabs.findIndex((t) => t.visible));
  }, [tabs[activeTab].visible]);

  return (
    <div>
      <Nav tabs>
        {tabs.map(
          ({ title, visible }, tabIndex) =>
            visible && (
              <NavItem key={tabIndex}>
                <NavLink
                  href="#"
                  className={activeTab == tabIndex ? 'active' : ''}
                  onClick={() => setActiveTab(tabIndex)}
                >
                  {title}
                </NavLink>
              </NavItem>
            )
        )}
      </Nav>
      <TabContent activeTab={activeTab}>
        {tabs.map(
          ({ refs, visible }, tabIndex) =>
            visible && (
              <TabPane key={tabIndex} tabId={tabIndex}>
                <Row>
                  <Col sm="12">
                    {children.filter((c) => c && refs.find((r) => c.props.id === r))}
                  </Col>
                </Row>
              </TabPane>
            )
        )}
      </TabContent>
    </div>
  );
}
