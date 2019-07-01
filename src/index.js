import React, {useState} from 'react';

import "./FullPageSlider.css";

const pushFrontToBottom = (arr) => {
    let newArr = [];
    let front = arr[0];
    for (let i = 1; i < arr.length; i++) {
        newArr.push(arr[i])
    }
    newArr.push(front)
    return newArr;
}

const FullPageSlider = (props) => {
    const [startPos, setStartPos] = useState({x: 0, y: 0});
    const [offset, setOffset] = useState(0);
    const [cursorDown, setCursorDown] = useState(false);
    const [children, setChildren] = useState(props.children);
    const [multiplier, setMultiplier] = useState(null);
    const direction = props.vertical ? "vertical" : "horizontal";
    const windowReference = direction === "vertical" ? window.innerHeight :  window.innerWidth;
    const clientPos = direction === "vertical" ? "y" : "x";

    let timer = undefined;
    let localOffset = 0;
    let timerCount = 0;

    const onCursorDown = (event) => {
        setCursorDown(true);
        setStartPos({x: event.clientX, y: event.clientY})
      }

    const onCursorMove = (event) => {
        if (cursorDown) {
            if (!multiplier) {
                const multi = event["client" + clientPos.toUpperCase()] - startPos[clientPos] >= 0 ? +1 : -1;
                setMultiplier(multi)
            } else {
                setOffset(event["client" + clientPos.toUpperCase()] - startPos[clientPos])
                if (Math.abs(offset) > (windowReference / 2)) {
                    setCursorDown(false);
                    localOffset = offset + (event["client" + clientPos.toUpperCase()] * multiplier);
                    timer = setInterval(() => {
                        timerCount++;
                        localOffset = (localOffset + (Math.round(timerCount * (timerCount/2))) * multiplier);
                        setOffset(localOffset)
                        if (Math.abs(localOffset) > windowReference) setNextPage()
                    }, 10);
                }
            }
        }
    }

    const onCursorUp = (event) => {
        if (Math.abs(offset) <= (windowReference / 2)) {
            setOffset(0)
            setMultiplier(null)
        }
        setCursorDown(false);
        setStartPos({x: 0, y: 0})
    }

    const setNextPage = () => {
        clearInterval(timer);
        setMultiplier(null);
        localOffset = 0;
        timerCount = 0;
        setStartPos({x: 0, y: 0});
        setOffset(0);
        setChildren(pushFrontToBottom(children))
    }

    return(
        <div className="full_page_slider_container"
        onMouseDown={e => onCursorDown(e)}
        onTouchStart={e => onCursorDown(e)}
        onTouchMove={e => onCursorMove(e)}
        onMouseMove={e => onCursorMove(e)}
        onTouchEnd={e => onCursorUp(e)}
        onMouseUp={e => onCursorUp(e)}
        >
            {children
                && children.map((child, i) => <FullPageSlide
                                                    key={i}
                                                    direction={direction}
                                                    offset={i === 0 ? offset : 0}
                                                    zIndex={10-i}>
                                                    {child}
                                                    </FullPageSlide>)}
        </div>
    )
}

const FullPageSlide = ({zIndex, offset, direction, children}) => {

    const style = {
        minHeight: "100vh",
        position: "fixed",
        width: "100%",
        height: "100%",
        top: direction === "vertical" ? offset : 0,
        left: direction === "horizontal" ? offset : 0,
        zIndex
    }

    return(
        <div style={style} className="noselect">
            {children}
        </div>
    )
}

export default FullPageSlider;