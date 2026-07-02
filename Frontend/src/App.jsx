import { Routes, Route } from "react-router-dom";

import Landing from "./Pages/landing/Landing";
import Step1TravelDetails from "./Pages/step1-Travel-details/Step1Traveldetails";
import Step2Flights from "./Pages/step2-Flight/Step2Flights";
import Step3Hotels from "./Pages/step3-hotels/Step3Hotels";
import Step4Activities from "./Pages/step4-activities/Step4Activities";
import Step5Transport from "./Pages/step5-transport/Step5Transport";
import Confirmation from "./Pages/Confirmation/Confirmation";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/step1" element={<Step1TravelDetails />} />
      <Route path="/step2" element={<Step2Flights />} />
      <Route path="/step3" element={<Step3Hotels />} />
      <Route path="/step4" element={<Step4Activities />} />
      <Route path="/step5" element={<Step5Transport />} />
      <Route path="/confirmation" element={<Confirmation />} />
    </Routes>
  );
}

export default App;