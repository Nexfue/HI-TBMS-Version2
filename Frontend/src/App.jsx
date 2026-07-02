import { Provider } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { store } from './Store/store';
import Landing from './Pages/landing/Landing';
import Step2Flights from './Pages/step2-Flight/Step2Flights';

const App = () => {
  return (
    <Provider store={store}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/step2" element={<Step2Flights />} />
      </Routes>
    </Provider>
  );
};

export default App;
