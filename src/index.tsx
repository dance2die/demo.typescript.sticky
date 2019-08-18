import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";

import { StickyContainer, StickySection, Sticky } from "./Sticky";

const containerStyle = {
  height: "85vh",
  width: "100%",
  overflowY: "auto"
};

function App() {
  const handleStuck = target => {
    // console.log(`Stuck!`, target)
    // target.style.backgroundColor = '#4caf50'
    // target.style.boxShadow =
    //   '0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12), 0 3px 5px -1px rgba(0, 0, 0, 0.4)'
  };
  const handleUnstuck = target => {
    // console.log(`UNstuck!`, target)
    // target.style.backgroundColor = 'rebeccapurple'
    // target.style.boxShadow = ''
  };
  const handleChange = ({ target, type }) => {
    console.log(`Changed!!`, type, target);
    if (type === "stuck") {
      target.style.backgroundColor = "#4caf50";
      target.style.boxShadow =
        "0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12), 0 3px 5px -1px rgba(0, 0, 0, 0.4)";
    } else {
      target.style.backgroundColor = "rebeccapurple";
      target.style.boxShadow = "";
    }
  };

  const stickySectionElements = Array.from({ length: 3 }, (_, i) => i + 1).map(
    key => (
      <StickySection
        key={key}
        style={{ height: "105vh" }}
        onStuck={handleStuck}
        onUnstuck={handleUnstuck}
        onChange={handleChange}
      >
        <Sticky id={key.toString()} as="h1" className="sticky">
          Sticky Header {key}
        </Sticky>
        <h3>{key} -- Some content under the sticky header</h3>
        <article>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
          elementum ante nec viverra pharetra. Fusce nec elementum lorem. Aenean
          nunc metus, vulputate sed augue sit amet, congue vulputate arcu. Etiam
          felis orci, hendrerit rutrum aliquet non, sodales finibus ligula.
          Morbi posuere vitae quam congue fringilla. Maecenas arcu est, tempus
          lacinia. Pellentesque at lectus varius, rhoncus mi et, commodo sapien.
          Proin euismod pharetra ligula ac tempus. Nam a nibh in leo facilisis
          semper sed nec nulla. Nam sed tellus sed est sodales convallis.
          Praesent felis sapien, auctor nec venenatis eu, vehicula vitae nibh.
          at lectus varius, rhoncus mi et, commodo sapien. Proin euismod
          pharetra ligula ac tempus. Nam a nibh in leo facilisis semper sed nec
          nulla. Nam sed tellus sed est sodales convallis. Praesent felis
          sapien, auctor nec venenatis eu, vehicula vitae nibh. Vestibulum vel
          imperdiet massa. Nunc ac neque lacinia, sodales sapien at, finibus
          eros.
        </article>
      </StickySection>
    )
  );

  return (
    <div className="App">
      <StickyContainer as="main" style={containerStyle}>
        {stickySectionElements}
      </StickyContainer>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
