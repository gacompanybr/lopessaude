import { useState } from "react";
import EvolutionConnect from "./EvolutionConnect";
import DispatchCampaign from "./DispatchCampaign";

const DispatchTab = () => {
  const [connected, setConnected] = useState(false);
  return (
    <div className="space-y-6">
      <EvolutionConnect onStatusChange={setConnected} />
      <DispatchCampaign connected={connected} />
    </div>
  );
};

export default DispatchTab;
