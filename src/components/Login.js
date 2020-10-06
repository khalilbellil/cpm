import React, { useState } from 'react'
import { useHistory } from 'react-router-dom';
import { TextField, Input, FormGroup, Button } from '@material-ui/core'
import { Spinner } from 'reactstrap';

function Login() {
    const [usernameInput, setUsernameInput] = useState('')
    const [passwordInput, setPasswordInput] = useState('')
    const history = useHistory()

    const loadingSpinner = (start) => {
        let spinner = document.getElementById("loading_spinner")
        if (start){
            spinner.style.display = "block"
        }else{
            spinner.style.display = "none"
        }
    }
    const login = () => {
        loadingSpinner(true)
        fetch(`http://ssrv5.sednove.com:4000/login?username=${usernameInput}&password=${passwordInput}`)
        .then(response => response.json())
        .then(response => {
            if (response.data.isLogged === 'yes'){
                history.push({
                    pathname: '/cpm',
                    state: { isLogged: 'yes', username: usernameInput}
                  })
                //alert("Logged")
            }else{
                alert("Failed")
            }
            loadingSpinner(false)
        })
        .catch(err => alert(err))
    }

    return (
        <div>
            <Spinner animation="border" role="status" style={{zIndex: "1000",position: "fixed", top: "50%", left: "50%", display: "none", color: "blue"}} id="loading_spinner">
                <span className="sr-only">Loading...</span>
            </Spinner>
            <TextField defaultValue=" " label="Username" variant="outlined" name="username"
            onChange={(e)=>{setUsernameInput(e.target.value)}}
            value={usernameInput}/>
            <TextField defaultValue=" " label="Password"  style={{marginLeft: "10px"}} variant="outlined" type="password" name="password"
            onChange={(e)=>{setPasswordInput(e.target.value)}}
            value={passwordInput}/>
            <br/><br/>
            <Button variant="contained" color="primary" onClick={()=>login()}>Sign In</Button>
        </div>
    )
}

export default Login
