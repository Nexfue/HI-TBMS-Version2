import { Provider } from 'react-redux';
import { Routes, Route } from "react-router-dom";
import { store } from './Store/store';

import Landing from "./Pages/landing/Landing";

import Step2Flights from "./Pages/step2-Flight/Step2FlightsResult"
import Step3Hotels from "./Pages/step3-hotels/Step3Hotels";
import HotelResults from './Pages/step3-hotels/HotelResults'; 
 import RoomDetails from './Pages/step3-hotels/RoomDetails'; 
import Step4Activities from "./Pages/step4-activities/Step4Activities";
import Step5Transport from "./Pages/step5-transport/Step5Transport";
import Confirmation from "./Pages/Confirmation/Confirmation";
import ScrollToTop from "./Components/ScrollComponent"

function App() {
  return (
    <Provider store={store}>
       <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/search-flights" element={<Step2Flights />} />
        <Route path="/hotel" element={<Step3Hotels />} />
        <Route path="/hotel/results" element={<HotelResults />} />
        <Route path="/room/:id" element={<RoomDetails />} />
        <Route path="/step4" element={<Step4Activities />} />
        <Route path="/step5" element={<Step5Transport />} />
        <Route path="/confirmation" element={<Confirmation />} />
      </Routes>
    </Provider>
  );
}

export default App;
