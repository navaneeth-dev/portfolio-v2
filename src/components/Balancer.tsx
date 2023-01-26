import Balancer from "react-wrap-balancer";

interface Props {
  children: React.ReactNode;
}

const BalancerComponent: React.FC<Props> = ({ children }) => {
  return <Balancer>{children}</Balancer>;
};

export default BalancerComponent;
