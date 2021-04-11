import { Range } from 'immutable';
import { useCallback, useState } from 'react';
import { Col, Container, Row, Table } from 'reactstrap';
import './App.css';
import { shuffleArray } from './utils/utils';

function IX(x, y) {
  return x * 7 + y;
}

function clickTimes(times) {
  return Range(0, times.length - 1).map((i) => ({
    time: (times[i + 1].time - times[i].time) / 1000,
    cell: times[i + 1].cell,
  }));
}

function averageTime(times) {
  return clickTimes(times).reduce((s, x) => s + x.time, 0) / (times.length - 1);
}

function App() {
  const [indexes] = useState(Array.from({ length: 7 }));
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [table, setTable] = useState(
    shuffleArray(
      Range(0, 49)
        .map((i) => ({
          number: (i % 25) + 1,
          color: i >= 25,
          clicked: false,
        }))
        .toArray()
    )
  );
  const [current, setCurrent] = useState({ number: 1, color: false });
  const [times, setTimes] = useState([]);
  const [misses, setMisses] = useState(0);

  const onCellClick = useCallback(
    (index) => {
      const cell = table[index];
      if (cell.number === current.number && cell.color === current.color) {
        cell.clicked = true;
        if (current.number === 25 && !current.color) {
          setFinished(true);
        }
        setTable(table.slice());
        setCurrent({
          number: 25 - current.number + current.color,
          color: !current.color,
        });
        setTimes(times.concat({ time: new Date(), cell }));
      } else {
        setMisses(misses + 1);
      }
    },
    [current.color, current.number, misses, table, times]
  );

  const onStartClick = useCallback(() => {
    setStarted(true);
    setTimes(times.concat({ time: new Date() }));
  }, [times]);

  if (!started) {
    return (
      <div className="vw-100 vh-100 d-flex justify-content-center align-items-center">
        <button className="btn btn-dark btn-custom" onClick={onStartClick}>
          Start
        </button>
      </div>
    );
  }

  return (
    <Container fluid>
      <Row
        className="align-items-center"
        style={{ justifyContent: 'space-evenly' }}
      >
        <Col xs="auto" className="cell">
          {current.color || finished ? (
            <></>
          ) : (
            <div className="d-flex cell bg-black">{current.number}</div>
          )}
        </Col>
        <Col xs="auto">
          <Table color="dark" bordered className="w-auto mx-auto">
            <tbody>
              {indexes.map((_, i) => (
                <tr key={i}>
                  {indexes.map((_, j) => (
                    <td key={IX(i, j)} className="p-0">
                      <div
                        className={`d-flex cell bg-${
                          table[IX(i, j)].color ? 'red' : 'black'
                        }${table[IX(i, j)].clicked ? ' clicked' : ''}`}
                        onClick={() => onCellClick(IX(i, j))}
                      >
                        {table[IX(i, j)].number}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>

        <Col xs="auto" className="cell">
          {current.color && !finished ? (
            <div className="d-flex cell bg-red">{current.number}</div>
          ) : (
            <></>
          )}
        </Col>
      </Row>
      {finished ? (
        <>
          <Row>
            <Col>
              Общее время (c):{' '}
              {(times[times.length - 1].time - times[0].time) / 1000}
            </Col>
          </Row>
          <Row>
            <Col>Количество промахов: {misses}</Col>
          </Row>
          <Row>
            <Col>
              Среднее время обработки одной цифры (c): {averageTime(times)}
            </Col>
          </Row>
          <Row>
            <Col>
              <Table bordered className="w-auto">
                <thead>
                  <th>Цифра</th>
                  <th>Время (c)</th>
                </thead>
                <tbody>
                  {clickTimes(times).map((time) => (
                    <tr>
                      <td
                        className={`text-white bg-${
                          time.cell.color ? 'red' : 'black'
                        }`}
                      >
                        {time.cell.number}
                      </td>
                      <td>{time.time}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </>
      ) : (
        <></>
      )}
    </Container>
  );
}

export default App;
