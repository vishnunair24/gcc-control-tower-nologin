import infiniteLogo from "./assets/customers/infinite.svg";
import vipLogo from "./assets/customers/vip.svg";
import routewareLogo from "./assets/customers/routeware.svg";
import summitLogo from "./assets/customers/summit.svg";
import acmeLogo from "./assets/customers/acme.svg";
import globexLogo from "./assets/customers/globex.svg";
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
  { key: "Summit", label: "Summit", logo: summitLogo },
  { key: "Acme", label: "Acme Corp", logo: acmeLogo },
  { key: "Globex", label: "Globex", logo: globexLogo },
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
