import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Link, Route } from "react-router-dom";
import Home from "./routes/Home";
import Cpm from './routes/Cpm';

function App() {

  useEffect(() => {
    // Run! Like go get some data from an API.
    // When the user scrolls the page, execute myFunction
    window.onscroll = function() {myFunction()};

    // Get the header
    var header = document.getElementById("header");

    // Get the offset position of the navbar
    var sticky = header.offsetTop;

    // Add the sticky class to the header when you reach its scroll position. Remove "sticky" when you leave the scroll position
    function myFunction() {
      if (window.pageYOffset > sticky) {
        header.classList.add("sticky");
      } else {
        header.classList.remove("sticky");
      }
    }
  });

  return (
    <Router>
      <div className="App">
        <div class="header row" id="header">
          <div class="col">
            <h2><Link to="/">SR</Link></h2>
          </div>
        </div>
        <div class="content">
          <Switch>
            <Route path="/cpm">
              <Cpm />
            </Route>
            <Route path="/call_center">
              Call Center
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;