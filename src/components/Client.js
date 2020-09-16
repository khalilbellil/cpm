import React, { useEffect, useState } from 'react'
import '../styles/Client.css'
import { TextField } from '@material-ui/core'

function Client(props) {

    const [clientData, setClientData] = useState({})
    const [clientAddressData, setClientAddressData] = useState({})

    useEffect(() => {
        getClientData(props.uid)
    }, [props.uid]);

    const saveAjax = (table, uid, one, one_val) => {
        fetch(`http://ssrv5.sednove.com:4000/update/one?table=${table}&uid=${uid}&one=${one}&one_val=${one_val}`)
        .catch(err => alert(err))
    }
    const getClientData = (uid_client) => {
        fetch('http://ssrv5.sednove.com:4000/clients/get?uid='+uid_client)
        .then(response => response.json())
        .then(response => {
            if (response.data[0] !== undefined){
                setClientData(response.data[0])
            }else{
                setClientData({})
                alert("Client introuvable !")
            }
        })
        .then(() => getClientAddress(uid_client))
        .catch(err => alert(err))
    }
    const getClientAddress = (uid_client) => {
        fetch('http://ssrv5.sednove.com:4000/client_phone?uid_client='+uid_client)
        .then(response => response.json())
        .then(response => setClientAddressData(response.data[0])
        )
        .catch(err => alert(err))
    }

    return (
        <div class="client_panel">
            <div class="row">
                <div class="col client__input">
                    <TextField defaultValue=" " label="Prénom*" variant="outlined" name="firstname" 
                    value={clientData.firstname} onChange={(e) => {setClientData({...clientData,firstname:e.target.value});saveAjax("sr_client",clientData.uid,"firstname",e.target.value);}}/>
                </div>
                <div class="col client__input">
                    <TextField defaultValue=" " label="Nom*" variant="outlined" name="lastname"
                    value={clientData.lastname} onChange={(e) => {setClientData({...clientData,lastname:e.target.value});saveAjax("sr_client",clientData.uid,"lastname",e.target.value);}}/>
                </div>
                <div class="col client__input">
                    <TextField label="Genre" name="gender" select SelectProps={{ native: true }} variant="outlined"
                    value={clientData.gender} onChange={(e) => {setClientData({...clientData,gender:e.target.value});saveAjax("sr_client",clientData.uid,"gender",e.target.value);}}>
                        <option value="m">Male</option>
                        <option value="f">Female</option>
                    </TextField>
                </div>
            </div>
            <div class="row">
                <div class="col client__input">
                    <TextField defaultValue=" " label="Courriel*" variant="outlined" name="email"
                    value={clientData.email} onChange={(e) => {setClientData({...clientData,email:e.target.value});saveAjax("sr_client",clientData.uid,"email",e.target.value);}}/>
                </div>
                <div class="col client__input">
                    <TextField defaultValue=" " label="Téléphone*" variant="outlined" name="phone1"
                    value={clientAddressData.phone1} onChange={(e) => {setClientAddressData({...clientAddressData, phone1:e.target.value});saveAjax("sr_address",clientAddressData.uid,"phone1",e.target.value);}}/>
                </div>
                <div class="col client__input">
                    <TextField label="1er Langue*" name="lang" select SelectProps={{ native: true }} variant="outlined"
                    value={clientData.lang} onChange={(e) => {setClientData({...clientData,lang:e.target.value});saveAjax("sr_client",clientData.uid,"lang",e.target.value);}}>
                        <option>FR</option>
                        <option>EN</option>
                    </TextField>
                </div>
            </div>
            <div class="row">
                <div class="col client__input">
                    <TextField defaultValue=" " label="Quand appeler ?*" variant="outlined" name="when_to_call"
                    value={clientData.when_to_call} onChange={(e) => {setClientData({...clientData,when_to_call:e.target.value});saveAjax("sr_client",clientData.uid,"when_to_call",e.target.value);}}/>
                </div>
                <div class="col client__input">
                    <TextField defaultValue=" " label="Commentaire interne*" variant="outlined" name="comments"
                    value={clientData.comments} onChange={(e) => {setClientData({...clientData,comments:e.target.value});saveAjax("sr_client",clientData.uid,"comments",e.target.value);}}/>
                </div>
                <div class="col client__input">
                    <TextField label="Langue(s) parlée(s)*" name="languages" select SelectProps={{ native: true }} variant="outlined"
                    value={clientData.languages} onChange={(e) => {setClientData({...clientData,languages:e.target.value});saveAjax("sr_client",clientData.uid,"languages",e.target.value);}}>
                        <option value="1">FR</option>
                        <option value="2">EN</option>
                        <option value="3">Bilingue</option>
                    </TextField>
                </div>
            </div>
        </div>
    )
}

export default Client
