// TableStateContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import vars from "../config";
import { globalFuncs } from "./global";
const LoginStateContext = createContext();

export const LoginStateProvider = ({ children }) => {
  const { setShowLoad } = globalFuncs();
  //let redirect = useNavigate();
  console.log("LoginStateProvider rendered");
  const [loginState, setLoginState] = useState({
    user: { isDev: false, isAdmin: false, isRepairTech: false },
    loggedin: false,
    loading: true,
    square: false,
  });

  const checkLogin = async () => {
    console.log("Checking login from context");
    //setLoginState((prev) => ({ ...prev, loading: true }));
    try {
      const response = await fetch(`${vars.serverUrl}/auth/authCheck`, {
        method: "GET",
        credentials: "include",
      });
      const res = await response.json();
      if (res.res === 401) {
        setLoginState((prev) => ({ ...prev, user: null, loggedin: false, loading: false }));
        setShowLoad(false);
        //redirect(`/auth/signout`, { replace: false });
      } else {
        setLoginState((s) => ({ ...s, loggedin: true, loading: false, user: res.user }));
        setShowLoad(false);
        //setLoginState((prev) => ({ ...prev, user: res.user, loading: false, loggedin: true }));
      }
    } catch (error) {
      setShowLoad(false);
      setLoginState((prev) => ({ ...prev, user: null, loggedin: false, loading: false }));
      console.error("Error checking login:", error);
    }
  };

  useEffect(() => {
    checkLogin();
    setInterval(() => {
      checkLogin();
    }, 60000);
  }, []);
  const checkSquare = async () => {
    const response = await fetch(`${vars.serverUrl}/square/checkconfig`, {
      credentials: "include",
    });
    const res = await response.json();
    if (res.res === 401) {
      setLoginState((prev) => ({ ...prev, loading: false, square: false }));
    } else {
      setLoginState((prev) => ({ ...prev, loading: false, square: true }));
    }
  };

  return (
    <LoginStateContext.Provider value={{ loginState, setLoginState, checkLogin }}>
      {children}
    </LoginStateContext.Provider>
  );
};

export const useLoginState = () => useContext(LoginStateContext);
