import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import QRGenerator from './components/QRGenerator';
import HistoryPage from './components/HistoryPage';

function App() {
  return (
      <Router>
        <Switch>
          <Route path="/login" component={LoginPage} />
          <ProtectedRoute path="/generate" component={QRGenerator} />
          <ProtectedRoute path="/history" component={HistoryPage} />
          <Route path="/" exact component={LoginPage} />
        </Switch>
      </Router>
  );
}

export default App;
