import infiniteLogo from "./assets/customers/Infinite.png";
import vipLogo from "./assets/customers/VIP.png";
import routewareLogo from "./assets/customers/Routeware.png";
import netdocuments from "./assets/customers/netdocuments.png";
import Acumatica from "./assets/customers/Acumatica.png";
import Comply from "./assets/customers/Comply.png";
import blueSkyLogo from "./assets/customers/bluesky.svg";
import northStarLogo from "./assets/customers/northstar.svg";
import vertexLogo from "./assets/customers/vertex.svg";
import nimbusLogo from "./assets/customers/nimbus.svg";
import pinnacleLogo from "./assets/customers/pinnacle.svg";
import auroraLogo from "./assets/customers/aurora.svg";

export const CUSTOMERS = [
  { key: "Infinite", label: "Infinite", logo: infiniteLogo },
  { key: "VIP", label: "VIP", logo: vipLogo },
  { key: "Routeware", label: "Routeware", logo: routewareLogo },
  { key: "netdocuments", label: "netdocuments", logo: netdocuments },
  { key: "Acumatica", label: "Acumatica", logo: Acumatica },
  { key: "Comply", label: "Comply", logo: Comply },
  { key: "BlueSky", label: "BlueSky", logo: blueSkyLogo },
  { key: "NorthStar", label: "NorthStar", logo: northStarLogo },
  { key: "Vertex", label: "Vertex", logo: vertexLogo },
  { key: "Nimbus", label: "Nimbus", logo: nimbusLogo },
  { key: "Pinnacle", label: "Pinnacle", logo: pinnacleLogo },
  { key: "Aurora", label: "Aurora", logo: auroraLogo },
];

export const CUSTOMER_LOGO_MAP = CUSTOMERS.reduce((acc, c) => {
  acc[c.key] = c.logo;
  return acc;
}, {});
