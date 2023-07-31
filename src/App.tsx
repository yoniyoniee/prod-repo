import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Header from "./Components/Header";
import Home from "./Routes/Home";
import Search from "./Routes/Search";
import Upload from "./Routes/Upload";
import Footer from "./Components/Footer";

function App() {
  return (
    <Router>
      <Header />
      <Switch>
        <Route path="/upload">
          <Upload />
        </Route>
        <Route path="/search">
          <Search />
        </Route>
        <Route path={["/", "/movies/:movieId"]}>
          <Home />
        </Route>
      </Switch>
      <Footer />
    </Router>
  );
}

export default App;
