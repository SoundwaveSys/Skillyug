import React from "react";
import "./Astronaut.scss"; // make sure to keep your CSS in this file

export default function Ship() {
  // Generate 20 hover areas dynamically
  const hoverAreas = Array.from({ length: 20 }, (_, i) => (
    <div key={i} className="hover-area"></div>
  ));

  return (
    <div className="scene">
      


      {/* Ship */}
      <div className="ship">
        <div className="wrapper">
          <div className="body side left"></div>
          <div className="body main">
            <div className="wing left"></div>
            <div className="wing right"></div>
            <div className="booster"></div>
            <div className="exhaust"></div>
          </div>
          <div className="body side right"></div>
        </div>
      </div>
    </div>
  );
}
