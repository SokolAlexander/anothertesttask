import logo from "./logo.svg";
import "./App.css";
import { useEffect, useRef, useState } from "react";

const mockData = [];
for (let i = 0; i < 5000; i++) {
  mockData.push(i);
}

const p = new Promise((res) => {
  setTimeout(() => res(), 1000);
});

const viewportHeight = window.innerHeight;
const defThreshold = 90;

const List = ({ data, onEndReached }) => {
  const [dataToRender, setDataToRender] = useState([data[0]]);
  const firstEl = useRef();
  const wrapperEl = useRef();
  const elHeight = useRef(30);
  const diffInitial = useRef(0);
  const scrollVal = useRef(0);

  const [marginBottom, setMarginBottom] = useState(0);
  const placeholderTop = useRef();
  const hiddenElsTop = useRef(0);

  useEffect(() => {
    elHeight.current = firstEl.current.offsetHeight;
    const totalHeight = data.length * elHeight.current;
    diffInitial.current = totalHeight - viewportHeight;

    const lengthToBeDiplayed = Math.ceil(viewportHeight / elHeight.current) + 5;
    const copy = [...data];
    // removing hidden elements from the start of array
    copy.splice(0, hiddenElsTop.current);

    // removing hidden elements from the end of array
    copy.length = lengthToBeDiplayed;
    const heightToBeDisplayed = lengthToBeDiplayed * elHeight.current;
    diffInitial.current = heightToBeDisplayed - viewportHeight;
    setDataToRender(copy);
  }, [data]);

  useEffect(() => {
    const heightToBeDisplayed = dataToRender.length * elHeight.current;
    diffInitial.current = heightToBeDisplayed - viewportHeight;
  }, [dataToRender]);

  const handleScroll = () => {
    scrollVal.current = wrapperEl.current.scrollTop;

    // we're scrolling to bottom and hiding top els
    if (
      scrollVal.current >
      hiddenElsTop.current * elHeight.current + defThreshold
    ) {
      const copy = [...dataToRender];

      if (data.length - hiddenElsTop.current > dataToRender.length) {
        const elToAdd = data[dataToRender.length + hiddenElsTop.current];
        copy.push(elToAdd);
      } else {
        onEndReached();
      }
      hiddenElsTop.current++;

      copy.shift();

      setDataToRender(copy);
      setMarginBottom(marginBottom + elHeight.current);
    } else if (
      // we're scrolling to top and showing top els
      hiddenElsTop.current &&
      scrollVal.current <=
        (hiddenElsTop.current - 1) * elHeight.current + defThreshold
    ) {
      hiddenElsTop.current--;

      setMarginBottom(marginBottom - elHeight.current);
      const copy = [...dataToRender];
      copy.unshift(data[hiddenElsTop.current]);
      copy.pop();
      setDataToRender(copy);
    }
  };

  useEffect(() => {
    if (data.length * elHeight.current < viewportHeight + defThreshold) {
      onEndReached();
    }
  }, [data.length]);

  return (
    <div
      ref={wrapperEl}
      style={{
        maxHeight: viewportHeight,
        overflow: "scroll",
        margin: "0px 20px",
      }}
      onScroll={handleScroll}
    >
      <div ref={placeholderTop} style={{ height: marginBottom + "px" }} />

      {dataToRender.map((el, i) => (
        <div
          key={el}
          ref={i === 0 ? firstEl : null}
          style={{
            borderBottom: "1px solid black",
            padding: "10px",
          }}
        >
          {el}
        </div>
      ))}
    </div>
  );
};

function App() {
  const [data, setData] = useState(mockData.slice(0, 5));

  const handleScrollEnd = () => {
    if (data.length <= mockData.length) {
      p.then(() => {
        setData([...data, ...[...mockData].splice(data.length, 15)]);
      });
    }
  };

  return (
    <div className="App">
      <List data={data} onEndReached={handleScrollEnd} />
    </div>
  );
}

export default App;
