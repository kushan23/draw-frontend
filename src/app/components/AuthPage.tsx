"use client"
import axios from "axios";
import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom";
import { BACKEND_URL, WS_URL } from "../config";
import { useRouter } from 'next/navigation'
export function AuthPage({isSignin} : {
    isSignin: boolean
}){
    const usernameref = useRef<HTMLInputElement>(null);
    const passwordref = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function login () {
        setLoading(true);
        const username = usernameref.current?.value;
        const password = passwordref.current?.value;
        const name = "user";
        let response = null;
        const url = isSignin ? "signin" : "signup"
        console.log(username);
        console.log(password);
        console.log(BACKEND_URL);
        console.log(WS_URL);
        try{
            response = await axios.post(`${BACKEND_URL}/${url}`,{
                username,
                password,
                ...(url === "signup" && {name})
        });
        const jwt = response?.data.token;
        console.log(response)
        console.log(jwt);
        if(jwt){
        localStorage.setItem('token', jwt);
        router.push('/rooms')
        }
        else{
            alert("Authentication failed. Please try again.");
        }
        } catch(error){
            alert("Authentication failed. Please try again.");

        } finally {
            setLoading(false); // Stop loading
        }


  
    

    }

    return <div className="w-screen h-screen flex justify-center items-center">
            <div className="p-2 m-2 bg-amber-600 rounded">
                <div className="p-4">
                <input type="text" ref={usernameref} placeholder="Email"></input>
                </div>
                <div className="p-4">
                <input type="password" ref={passwordref} placeholder="Password"></input>
                </div>
                <div className="pt-2 flex items-center justify-center">
                <button onClick={login}
                     disabled={loading}
                >
                    {loading ? "Loading..." : isSignin ? "Sign In" : "Sign Up"}
                </button>
                </div>
            </div>
    </div>
}