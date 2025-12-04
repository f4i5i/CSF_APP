import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const ServiceAuthProvider = (props) => {
  const [serviceprovider, setServiceprovider] = useState(localStorage.serviceprovider);

  const login = (serviceprovider) => {
    setServiceprovider(serviceprovider);
  };

  const logout = () => {
    localStorage.removeItem("serviceprovider");
    setServiceprovider(null);
  };

  return (
    <AuthContext.Provider value={{ serviceprovider, login, logout }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
