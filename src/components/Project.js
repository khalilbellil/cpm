import React, { useState, useEffect } from 'react'
import '../styles/Project.css'
import { TextField, FormControlLabel, Checkbox, Input, FormGroup, Card, Button } from '@material-ui/core'
import { Editor } from '@tinymce/tinymce-react'
import { format } from 'date-fns';
import usePlacesAutocomplete from "use-places-autocomplete";
import useOnclickOutside from "react-cool-onclickoutside";
import { Label, Form, CardTitle, CardText } from 'reactstrap';
import Popup from "reactjs-popup";
import google_map_logo from "../img/google-maps-round.png";
import call_logo from "../img/call.png";
import call_back_later_logo from "../img/call_back_later_logo.png";
import activate_logo from "../img/activate_logo.png";
import cancel_logo from "../img/cancel_logo.png";
import email_logo from "../img/email_logo.png";
import clipart from "../img/clipart.png";
import duplicate_logo from "../img/duplicate_logo.png";
import flag_for_review_logo from "../img/flag_for_review_logo.png";
import flag_for_review_logo_green from "../img/flag_for_review_logo_green.png";
import top_arrow_icon from "../img/top_arrow_icon.png";
import down_arrow_icon from "../img/down_arrow_icon.png";
import $ from "jquery";
import axios from 'axios';

function Project(props) {
    const [projectData, setProjectData] = useState({})
    const [addressData, setAddressData] = useState({})
    const [servicesData, setServicesData] = useState([])
    const [subServicesData, setSubServicesData] = useState([])
    const [serviceQuestionsData, setserviceQuestionsData] = useState([])
    const [callBackLaterData, setCallBackLaterData] = useState({})
    const [uidCancelReason, setUidCancelReason] = useState('')
    const [messageCancelReason, setMessageCancelReason] = useState('')
    const [cancelReasonsData, setCancelReasonsData] = useState([])
    const [messageSendQuestions, setMessageSendQuestions] = useState('')
    const [popupOpenSendQuestions, setPopupOpenSendQuestions] = useState(false)
    const [popupCallBackLater, setPopupCallBackLater] = useState(false)
    const [popupOpenFlagForReview, setPopupOpenFlagForReview] = useState(false)
    const [popupOpenFiles, setPopupOpenFiles] = useState(false)
    const [popupCancelProject, setPopupCancelProject] = useState(false)
    const [popupActivateProject, setPopupActivateProject] = useState(false)
    const [username, setUsername] = useState(props.username)
    const [uidUser, setUidUser] = useState(335)
    const [getNewPrice, setGetNewPrice] = useState(false)
    const [completeAddress, setCompleteAddress] = useState('')
    const [cityData, setCityData] = useState([])
    const [generalServiceQuestionsData, setGeneralServiceQuestionsData] = useState([])
    const [dialerPrefix, setDialerPrefix] = useState('')
    const [selectedFile, setSelectedFile] = useState('');
    const [nbPastedImg, setNbPastedImg] = useState(0)
    const [sentQuestionsAnswersData, setSentQuestionsAnswersData] = useState([])
    const [sentQuestionsAnswersQData, setSentQuestionsAnswersQData] = useState([])

    useEffect(() => {
        getCities()
        getProjectData(props.uid)
    }, [props.uid]);
    useEffect(() => {
        if (getNewPrice === true){
            getPrice(projectData.uid_subservice)
            setGetNewPrice(false)
        }
    }, [getNewPrice])
//#region FUNCTIONS
    const saveAjax = (table, uid, one, one_val) => {
        props.loadingSpinner(true)
        fetch(encodeURI(`http://ssrv5.sednove.com:4000/update/one?table=${table}&uid=${uid}&one=${one}&one_val=${one_val}`))
        .then(() => props.loadingSpinner(false))
        .catch(err => alert(err))
    }
    const getProjectData = (uid_project) => {
        fetch('http://ssrv5.sednove.com:4000/projects/get?uid='+uid_project)
        .then(response => response.json())
        .then(response => {
            if (response.data[0] !== undefined){
                let budget_type_final = response.data[0].budget_type
                if (budget_type_final !== null){
                    if (budget_type_final === "1"){
                        budget_type_final = `Budget pour main d'oeuvre uniquement`
                    }else if (budget_type_final === "2"){
                        budget_type_final = `Budget pour main d'oeuvre + matériaux`
                    }
                }
                let delay_from = ''
                let delay_to = ''
                let sn_cdate = ''
                if(response.data[0].delay_from !== undefined && response.data[0].delay_from !== ''){
                    delay_from = format(new Date(response.data[0].delay_from), 'yyyy-MM-dd')
                }
                if(response.data[0].delay_to !== undefined && response.data[0].delay_to !== ''){
                    delay_to = format(new Date(response.data[0].delay_to), 'yyyy-MM-dd')
                }
                if(response.data[0].sn_cdate !== undefined && response.data[0].sn_cdate !== ''){
                    sn_cdate = format(new Date(response.data[0].sn_cdate), 'yyyy-MM-dd hh:mm:ss a')
                }
                response.data[0] = {...response.data[0], 
                    delay_from: delay_from, 
                    delay_to: delay_to,
                    sn_cdate: sn_cdate, nb_files: countFiles(response.data[0]),
                    budget_type: budget_type_final
                }
                setProjectData(response.data[0])
                getServicesData()
                getSubServicesData(response.data[0].uid_service)
                getAddress(response.data[0].uid_address)
                getCallBackLater(response.data[0].uid)
                getCancelReasons()
                getGeneralServiceQuestions()
                getSentQuestionsAnswers(response.data[0].uid)
            }else{
                alert("Projet introuvable !")
            }
        })
        .catch(err => alert(err))
    }
    const getServicesData = () => {
        fetch('http://ssrv5.sednove.com:4000/services')
        .then(response => response.json())
        .then(response => setServicesData(response.data))
        .catch(err => alert(err))
    }
    const getSubServicesData = (uid_service) => {
        if(uid_service !== undefined){
            fetch('http://ssrv5.sednove.com:4000/subservices?uid_service='+uid_service)
            .then(response => response.json())
            .then(response => {
                setSubServicesData(response.data)
                getServiceQuestions(uid_service)
            })
            .catch(err => alert(err))
        }
    }
    const getAddress = (uid_address) => {
        if (uid_address)
            fetch('http://ssrv5.sednove.com:4000/address?uid='+uid_address)
            .then(response => response.json())
            .then(response => {
                response.data[0] = {...response.data[0], 
                    street_no:(response.data[0].street_no === null)?"":response.data[0].street_no,
                    street:(response.data[0].street === null)?"":response.data[0].street,
                    city:(response.data[0].city === null)?"":response.data[0].city,
                    zip:(response.data[0].zip === null)?"":response.data[0].zip,
                    province:(response.data[0].province === null)?"":response.data[0].province,
                    country:(response.data[0].country === null)?"":response.data[0].country
                }
                getDialerPrefix(response.data[0].phone1)
                setAddressData(response.data[0])
                setCompleteAddress(response.data[0].street_no+" "+response.data[0].street+" "+response.data[0].city+" "+response.data[0].zip+" "+
                response.data[0].province+" "+response.data[0].country)
            })
            .then(() => clearSuggestions())
            .catch(err => alert(err))
    }
    const countFiles = (project) => {
        var count = 0;
        if (project.file1 !== undefined && project.file1 !== null && project.file1 !== ""){
          count ++;
        }
        if (project.file2 !== undefined && project.file2 !== null && project.file2 !== ""){
          count ++;
        }
        if (project.file3 !== undefined && project.file3 !== null && project.file3 !== ""){
          count ++;
        }
        if (project.file4 !== undefined && project.file4 !== null && project.file4 !== ""){
          count ++;
        }
        if (project.file5 !== undefined && project.file5 !== null && project.file5 !== ""){
          count ++;
        }
        return count
    }
    const getCallBackLater = (uid_project) => {
        fetch(`http://ssrv5.sednove.com:4000/callbacklater/get?uid_project=${uid_project}`)
        .then(response => response.json())
        .then(response => {
          setCallBackLaterData(response.data[0])
        })
        .catch(err => alert(err))
    }
    const getCancelReasons = () => {
        fetch('http://ssrv5.sednove.com:4000/projects/get_cancel_reasons')
        .then(response => response.json())
        .then(response => setCancelReasonsData(response.data))
        .catch(err => alert(err))
    }
    const getSentQuestionsAnswers = (uid_project) => {
        fetch(`http://ssrv5.sednove.com:4000/projects/get_sent_question_answer?uid_project=${uid_project}`)
        .then(response => response.json())
        .then(response => {
            setSentQuestionsAnswersData(response.sr_project_sent_question_answer)
            setSentQuestionsAnswersQData(response.sr_service_question)
        })
        .catch(err => alert(err))
    }
    const saveAjaxAddress = (table, uid, one, one_val) => {
        if (addressData.uid !== undefined){
            fetch(`http://ssrv5.sednove.com:4000/update/one?table=${table}&uid=${uid}&one=${one}&one_val=${one_val}`)
            .then(() => {
                if(one === "phone1"){
                    setAddressData({...addressData, phone1: one_val})
                }else{
                    setAddressData({...addressData, phone2: one_val})
                }
            })
            .catch(err => alert("saveAjaxAddress" + err))
          }else{
            fetch(`http://ssrv5.sednove.com:4000/address/add?one=${one}&one_val=${one_val}&uid_client=${projectData.uid_client}`)
            .then(response => response.json())
            .then(response => {
              setProjectData({...projectData, uid_address: response.data.uid_address})
              saveAjax("sr_project", projectData.uid, "uid_address", response.data.uid_address)
              getAddress(response.data.uid_address)
            })
            .catch(err => alert("saveAjaxAddress" + err))
          }
    }
    const getServiceQuestions = (uid_service) => {
        setserviceQuestionsData([])
        fetch('http://ssrv5.sednove.com:4000/service_questions?uid_service='+uid_service)
        .then(response => response.json())
        .then(response => setserviceQuestionsData(response.data))
        .catch(err => alert(err))
    }
    const getGeneralServiceQuestions = () => {
        setGeneralServiceQuestionsData([])
        fetch('http://ssrv5.sednove.com:4000/service_questions?uid_service=161')
        .then(response => response.json())
        .then(response => setGeneralServiceQuestionsData(response.data))
        .catch(err => alert(err))
    }
    const activateProject = () => {
        if(projectData.status !== "active"){
            props.loadingSpinner(true)
            //validate
            fetch('http://ssrv5.sednove.com:4000/projects/activate?uid='+projectData.uid+'&employee='+projectData.employee)
            .then(() => {
                getProjectData(projectData.uid);
                addHistory("8", "")
                setPopupActivateProject(false)
            })
            .then(() => props.loadingSpinner(false))
            .catch(err => alert(err))
        }else{
            alert("Project already activated !")
        }
    }
    const cancelProject = () => {
        if(projectData.status !== "cancelled-before-qualification" && projectData.status !== "cancelled-after-qualification"){
            props.loadingSpinner(true)
            fetch(`http://ssrv5.sednove.com:4000/projects/cancel?uid=${projectData.uid}&status=${projectData.status}&uid_cancel_reason=${(uidCancelReason === '')?"0":uidCancelReason}
            &message=${messageCancelReason}&uid_client=${projectData.uid_client}&uid_user=${uidUser}`)
            .then(() => {
              //clientProjectCanceled(uid_project)
              getProjectData(projectData.uid);
              addHistory("7", "")
              setPopupCancelProject(false)
            })
            .then(() => props.loadingSpinner(false))
            .catch(err => alert(err))
        }else{
            alert("Projet déjà annulé !")
        }
    }
    const addHistory = (uid_msg, comments) => {
        fetch(`http://ssrv5.sednove.com:4000/client_history/add?uid_msg=${uid_msg}&uid_client=${projectData.uid_client}&uid_project=${projectData.uid}
        &username=${username}&comments=${comments}`)
        .then(() => {
          props.onReloadHistory(true)
        })
        .catch(err => alert(err))
    }
    const getPrice = (uid_subservice) => {
        fetch('http://ssrv5.sednove.com:4000/subservices/get?uid='+uid_subservice)
        .then(response => response.json())
        .then(response => {
          saveAjax("sr_project",projectData.uid,"lead_price",response.data[0].lead_price)
          saveAjax("sr_project",projectData.uid,"estimated_value",response.data[0].estimated_value)
          setProjectData({...projectData, lead_price: response.data[0].lead_price, estimated_value: response.data[0].estimated_value, uid_subservice: uid_subservice})
        })
        .catch(err => alert(err))
    }
    const callBackLater = () => {
        var date_callbacklater = document.getElementById("date_callbacklater").value;
        var time_callbacklater = document.getElementById("time_callbacklater").value;
        var comment_callbacklater = document.getElementById("comment_callbacklater").value;
        var call_back_date = date_callbacklater + " " + time_callbacklater + ":00";
        if(callBackLaterData === {}){
            props.loadingSpinner(true)
            fetch(`http://ssrv5.sednove.com:4000/callbacklater/add?uid_project=${projectData.uid}&uid_client=${projectData.uid_client}&call_back_date=${call_back_date}&followup_agent=${username}&comments=${comment_callbacklater}`)
            .then(() => {
                addHistory("3", "")
                setPopupCallBackLater(false)
            })
            .then(() => props.loadingSpinner(false))
            .catch(err => alert(err))
        }else{
            props.loadingSpinner(true)
            fetch(`http://ssrv5.sednove.com:4000/callbacklater/update?uid_project=${projectData.uid}&uid_client=${projectData.uid_client}&call_back_date=${call_back_date}&followup_agent=${username}&comments=${comment_callbacklater}`)
            .then(() => {
                addHistory("3", "")
                setPopupCallBackLater(false)
            })
            .then(() => props.loadingSpinner(false))
            .catch(err => alert(err))
        }
    }
    const flagForReview = () => {
        if(projectData.flag_for_review !== "1"){
            props.loadingSpinner(true)
            fetch(`http://ssrv5.sednove.com:4000/flagforreview/update?uid_project=${projectData.uid}&followup_agent=${username}`)
            .then(() => {
                //addHistory("3", "")
                setPopupOpenFlagForReview(false)
            })
            .then(() => props.loadingSpinner(false))
            .catch(err => alert(err))
        }
    }
    const openGoogleMap = () => {
        window.open("https://www.google.com/maps/place/"+addressData.street_no+" "+addressData.street+" "+addressData.city+" "+addressData.zip+" "+
        addressData.province+" "+addressData.country, '_blank');
    }
    const duplicateProject = () => {
        props.loadingSpinner(true)
        fetch('http://ssrv5.sednove.com:4000/projects/duplicate?uid='+projectData.uid)
        .then(() => {
            props.reload_projects()
        })
        .then(() => props.loadingSpinner(false))
        .catch(err => alert(err))
    }
    const getCities = () => {
        fetch(`http://ssrv5.sednove.com:4000/city`)
        .then(response => response.json())
        .then(response => setCityData(response.data))
        .catch(err => alert(err))
    }
    const handleEditorChange = (content, editor) => {
        setProjectData({...projectData,description: content})
        console.log(content)
        saveAjax("sr_project",projectData.uid,"description",content)
    }
    const handleEmployeeChange = (e) => {
        if (projectData.employee === "yes"){
            setProjectData({...projectData,employee: "no"})
            saveAjax("sr_project", projectData.uid, "employee", "no")
        }else{
            setProjectData({...projectData,employee: "yes"})
            saveAjax("sr_project", projectData.uid, "employee", "yes")
        }
    }
    const handleServiceChange = (e) => {
        setProjectData({...projectData, uid_service:e.target.value})
        saveAjax("sr_project",projectData.uid,"uid_service",e.target.value)
        getSubServicesData(e.target.value)
    }
    const handleSecondaryServiceChange = (e) => {
        setProjectData({...projectData, uid_secondary_service:e.target.value})
        saveAjax("sr_project",projectData.uid,"uid_secondary_service",e.target.value)
    }
    const handleSubServiceChange = async (e) => {
        setProjectData({...projectData, uid_subservice:e.target.value})
        saveAjax("sr_project",projectData.uid,"uid_subservice",e.target.value)
        setGetNewPrice(true)
    }
    const handleDelayChange = async (e) => {
        var sdate = new Date();
        var edate = new Date();
        var delay_from;
        var delay_to;
        var filter = e.target.value;
        if (filter === "1"){
            edate.setDate(edate.getDate() + 10);
            delay_from = sdate.getFullYear() + '-' + ('0' + (sdate.getMonth() + 1)).slice(-2) + '-' + ('0' + sdate.getDate()).slice(-2)
            delay_to = edate.getFullYear() + '-' + ('0' + (edate.getMonth() + 1)).slice(-2) + '-' + ('0' + edate.getDate()).slice(-2)
        }else if(filter === "2"){
            edate.setDate(sdate.getDate() + 15);
            delay_from = sdate.getFullYear() + '-' + ('0' + (sdate.getMonth() + 1)).slice(-2) + '-' + ('0' + sdate.getDate()).slice(-2);
            delay_to = edate.getFullYear() + '-' + ('0' + (edate.getMonth() + 1)).slice(-2) + '-' + ('0' + edate.getDate()).slice(-2);
        }else if(filter === "3"){
            sdate.setDate(sdate.getDate() + 0);
            edate.setDate(edate.getDate() + 30);
            delay_from = sdate.getFullYear() + '-' + ('0' + (sdate.getMonth() + 1)).slice(-2) + '-' + ('0' + sdate.getDate()).slice(-2);
            delay_to = edate.getFullYear() + '-' + ('0' + (edate.getMonth() + 1)).slice(-2) + '-' + ('0' + edate.getDate()).slice(-2);
        }else if(filter === "4"){
            sdate.setDate(sdate.getDate() + 0);
            edate.setDate(edate.getDate() + 60);
            delay_from = sdate.getFullYear() + '-' + ('0' + (sdate.getMonth() + 1)).slice(-2) + '-' + ('0' + sdate.getDate()).slice(-2);
            delay_to = edate.getFullYear() + '-' + ('0' + (edate.getMonth() + 1)).slice(-2) + '-' + ('0' + edate.getDate()).slice(-2);
        }else if(filter === "5"){
            sdate.setDate(sdate.getDate() + 0);
            edate.setDate(edate.getDate() + 130);
            delay_from = sdate.getFullYear() + '-' + ('0' + (sdate.getMonth() + 1)).slice(-2) + '-' + ('0' + sdate.getDate()).slice(-2);
            delay_to = edate.getFullYear() + '-' + ('0' + (edate.getMonth() + 1)).slice(-2) + '-' + ('0' + edate.getDate()).slice(-2);
        }else if(filter === "6"){
            sdate.setDate(sdate.getDate() + 180);
            edate.setDate(edate.getDate() + 365);
            delay_from = sdate.getFullYear() + '-' + ('0' + (sdate.getMonth() + 1)).slice(-2) + '-' + ('0' + sdate.getDate()).slice(-2);
            delay_to = edate.getFullYear() + '-' + ('0' + (edate.getMonth() + 1)).slice(-2) + '-' + ('0' + edate.getDate()).slice(-2);
        }else if(filter === "7"){
            sdate.setDate(sdate.getDate() + 365);
            edate.setDate(edate.getDate() + 1000)
            delay_from = sdate.getFullYear() + '-' + ('0' + (sdate.getMonth() + 1)).slice(-2) + '-' + ('0' + sdate.getDate()).slice(-2);
            delay_to = edate.getFullYear() + '-' + ('0' + (edate.getMonth() + 1)).slice(-2) + '-' + ('0' + edate.getDate()).slice(-2);
        }else if(filter === "8"){
            edate.setDate(edate.getDate() + 90)
            delay_from = sdate.getFullYear() + '-' + ('0' + (sdate.getMonth() + 1)).slice(-2) + '-' + ('0' + sdate.getDate()).slice(-2);
            delay_to = edate.getFullYear() + '-' + ('0' + (edate.getMonth() + 1)).slice(-2) + '-' + ('0' + edate.getDate()).slice(-2);
        }
        if (delay_from !== undefined){
            setProjectData({...projectData, delay_from: delay_from, delay_to: delay_to, delay_options: e.target.value})
            saveAjax("sr_project", projectData.uid,"delay_options", e.target.value)
            saveAjax("sr_project", projectData.uid,"delay_from", delay_from)
            saveAjax("sr_project", projectData.uid,"delay_to", delay_to)
        }
    }
    const handleQualityChange = (e) => {
        setProjectData({...projectData, quality:e.target.value})
        saveAjax("sr_project",projectData.uid,"quality",e.target.value)
    }
    const handleProjectTypeChange = (e) => {
        setProjectData({...projectData, uid_project_type:e.target.value})
        saveAjax("sr_project",projectData.uid,"uid_project_type",e.target.value)
    }
    const getCheckedQuestions = () => {
        var uid_questions = ""
        var i = 0;
        var checkboxes = [];
        $("input:checkbox[name=question]:checked").each(function(){
          checkboxes.push(this);
        });
        for (var checkbox of checkboxes) {
            var str = checkbox.id
            var final_id = str.replace("question_","")
            uid_questions += final_id
            if (i !== checkboxes.length - 1 && checkboxes.length !== 1)
              uid_questions += ","
            i++
        }
        sendQuestionsEmail("clientsProjectQuestions", uid_questions)
    }
    const sendQuestionsEmail = (name, uid_questions) => {
        props.loadingSpinner(true)
        fetch(`http://ssrv5.sednove.com:4000/nodemailer/sendquestions?uid_project=${projectData.uid}&uid_client=${projectData.uid_client}&uid_questions=${uid_questions}&uid_service=${projectData.uid_service}&message=${messageSendQuestions}&name=${name}`)
        .then(() => {
          addHistory("2", "");
          setPopupOpenSendQuestions(false)
        })
        .then(() => props.loadingSpinner(false))
        .catch(err => alert(err))
    }
    const showHideElement = (uid_element) => {
        var element = document.getElementById(uid_element)
        if (element.style.display === "none")
          element.style.display = "block"
        else
          element.style.display = "none"
    }
    const hideProject = () => {
        showHideElement("tohide_"+projectData.uid);
        var arrow = document.getElementById("hide_"+projectData.uid);
        if (arrow.src === top_arrow_icon)
          arrow.src = down_arrow_icon
        else
          arrow.src = top_arrow_icon
    }
    const getDialerPrefix = (phone) => {
        if (phone !== "" && phone !== undefined && phone !== "null" && phone !== " " && phone !== null && phone[3] !== undefined){
            let _phone = ""
            if (phone[0] === " "){
                _phone = phone[1] + phone[2] + phone[3]
            }else{
                _phone = phone[0] + phone[1] + phone[2]
            }
            _phone = _phone.replace(" ", "")
            fetch(`http://ssrv5.sednove.com:4000/get_dialer_prefix?first_digits=${_phone}`)
            .then(response => response.json())
            .then(response => {
                if (response.data[0] !== undefined){
                    response.data[0].ext = "*" + response.data[0].ext
                    setDialerPrefix(response.data[0].ext)
                }
            })
            .catch(err => alert(err))
        }
    }
    const onFileChangeHandler = (event) => {
        setSelectedFile(event.target.files[0])
        console.log(event.target.files[0])
    }
    const onClickUploadFile = (event) => {
        const data = new FormData()
        data.append('avatar', selectedFile)
        console.log("selectedFile" + selectedFile)
        axios.post('http://ssrv5.sednove.com:4000/upload-file', data)
        .then(res => {
            let path = res.data.data.path
            path = path.replace("./sn_uploads/", "/sn_uploads/")
            let content = `<p><img name="added_img_${projectData.uid}" src="https://soumissionrenovation.ca${path}" width="375" /></p>`
            setProjectData({...projectData,description: projectData.description+content})
        })
    }
    const handlePaste = (e) => {
        retrieveImageFromClipboard(e, function(imageBlob){
            // If there's an image, display it in the canvas
            if(imageBlob){
                var canvas = document.getElementById("mycanvas");
                var ctx = canvas.getContext('2d');
                // Create an image to render the blob on the canvas
                var img = new Image();
                // Once the image loads, render the img on the canvas
                img.onload = function(){
                    // Update dimensions of the canvas with the dimensions of the image
                    canvas.width = this.width;
                    canvas.height = this.height;
                    // Draw the image
                    ctx.drawImage(img, 0, 0);
                    // Upload image:
                    e.preventDefault();
                    var formData = new FormData($('#formarea')[0]);
                    var blob = dataURLtoBlob(canvas.toDataURL('image/jpeg'));
                    var filename = "pasted_" + projectData.uid + "_" + nbPastedImg + ".jpg";
                    setNbPastedImg(nbPastedImg + 1)
                    formData.append("avatar", blob, filename);
                    axios.post('http://ssrv5.sednove.com:4000/upload-file', formData)
                    .then(res => {
                        let path = res.data.data.path
                        path = path.replace("./sn_uploads/", "/sn_uploads/")
                        let content = `<p><img name="added_img_${projectData.uid}" src="https://soumissionrenovation.ca${path}" width="375" /></p>`
                        setProjectData({...projectData,description: projectData.description+content})
                    })
                };
                // Crossbrowser support for URL
                var URLObj = window.URL || window.webkitURL;
                // Creates a DOMString containing a URL representing the object given in the parameter
                // namely the original Blob
                img.src = URLObj.createObjectURL(imageBlob);
            }
            });
    }

    //#region Address Autocomplete
    const handleAddressChange = (e) => {
        setValue(e.target.value);
        setCompleteAddress(e.target.value)
    }
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
          /* Define search scope here */
        },
        debounce: 300,
    });
    const addressRef = useOnclickOutside(() => {
        // When user clicks outside of the component, we can dismiss
        // the searched suggestions by calling this method
        clearSuggestions();
    });
    const handleSuggestionSelect = ({ description,terms }) => () => {
        if (terms){
            saveAddress(terms)
        }
    };
    const renderSuggestions = () =>
    data.map((suggestion) => {
        const {
            id,
            structured_formatting: { main_text, secondary_text },
        } = suggestion;
        
        return (
            <li key={id} onClick={handleSuggestionSelect(suggestion)}>
            <strong>{main_text}</strong> <small>{secondary_text}</small>
            </li>
        );
    });
    const handleCityChange = (e) => {
        setAddressData({...addressData, uid_city: e.target.value})
        saveAjax("sr_address", addressData.uid, "uid_city", e.target.value)
    }
    const saveAddress = (terms) => {
        props.loadingSpinner(true)
        fetch(`http://ssrv5.sednove.com:4000/address/save?street_no=${(terms[0].value)?terms[0].value:""}&street=${(terms[1].value)?terms[1].value:""}&city=${(terms[2].value)?terms[2].value:""}&province=${(terms[3].value)?terms[3].value:""}&country=${(terms[4].value)?terms[4].value:""}&uid_client=${projectData.uid_client}&phone1=${(addressData.phone1)?addressData.phone1:""}&phone2=${(addressData.phone2)?addressData.phone2:""}`)
        .then(response => response.json())
        .then(response => {
            setProjectData({...projectData, uid_address: response.data.uid_address})
            saveAjax("sr_project", projectData.uid, "uid_address", response.data.uid_address)
            getUidCity(terms[2].value, response.data.uid_address)
            getZipCode(response.data.uid_address, terms)
        })
        .then(() => props.loadingSpinner(false))
        .catch(err => alert(err))
    }
    const getUidCity = (name, uid_address) => {
        fetch(`http://ssrv5.sednove.com:4000/city/get?name=${name}`)
        .then(response => response.json())
        .then(response => {
            setAddressData({...addressData, uid_city: response.data[0].uid})
            saveAjax("sr_address", uid_address, "uid_city", response.data[0].uid)
        })
        .catch(err => alert(err))
    }
    const getZipCode = (uid_address, terms) => {
        fetch(`http://ssrv5.sednove.com:4000/get_zipcode?address=${terms[0].value + " " + terms[1].value + " " + terms[2].value + " " + terms[3].value + " " + terms[4].value}`)
        .then(response => response.json())
        .then(response => {
            setAddressData({...addressData, zip: response.data[0].zipcode})
            saveAjax("sr_address", uid_address, "zip", response.data[0].zipcode)
        })
        .then(() => {getAddress(uid_address)})
        .catch(err => alert(err))
    }

    //#endregion
    //#region PASTE IMAGE
    const dataURLtoBlob = (dataURL) => {
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) == -1) {
          var parts = dataURL.split(',');
          var contentType = parts[0].split(':')[1];
          var raw = decodeURIComponent(parts[1]);
      
          return new Blob([raw], {
            type: contentType
          });
        }
        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;
        var uInt8Array = new Uint8Array(rawLength);
        for (var i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
      
        return new Blob([uInt8Array], {
          type: contentType
        });
    }
    const retrieveImageFromClipboard = (e, callback) => {
          if(e.clipboardData == false){
              if(typeof(callback) == "function"){
                  callback(undefined);
              }
          };
          
          var items = e.clipboardData.items;
          
          if(items == undefined){
              if(typeof(callback) == "function"){
                  callback(undefined);
              }
          };
          
          for (var i = 0; i < items.length; i++) {
              // Skip content if not image
              if (items[i].type.indexOf("image") == -1) {
              
              continue;    
              }
              
              // Retrieve image on clipboard as blob
              var blob = items[i].getAsFile();
      
              if(typeof(callback) == "function"){
                  callback(blob);
              }
          }
    }
    //#endregion
//#endregion
    
return (
        <div class="col project">
            <form enctype="multipart/form-data" method="post" id="formarea">
                <canvas hidden id="mycanvas" />
            </form>
            <div class="row p-2">
                <div class="col">
                    <img width="40px" src={activate_logo} alt="Activer" onClick={() => setPopupActivateProject(true)}></img>
                    <Popup
                    onClose={() => setPopupActivateProject(false)}
                    closeOnDocumentClick
                    open={popupActivateProject}
                    >
                    <span>
                        <Card body inverse class="popup">
                        <CardTitle class="popupbox_title" style={{textAlign:"center"}}>Activer le projet</CardTitle>
                        <CardText class="popupbox_content" style={{textAlign:"center"}}>Etes-vous sûre ?</CardText>
                        <div class="row">
                            <Button class="col ml-3 popupbox_button" variant="contained" color="primary" onClick={()=> {activateProject()}}>Oui</Button>
                            <Button class="col ml-2 mr-3 popupbox_button" variant="contained" color="primary" onClick={()=> setPopupActivateProject(false)}>Annuler</Button>
                        </div>
                        </Card>
                    </span>
                    </Popup>
                </div>
                <div class="col">
                    <img width="40px" src={cancel_logo} alt="Annuler" onClick={() => setPopupCancelProject(true)}></img>
                    <Popup
                    onClose={() => setPopupCancelProject(false)}
                    closeOnDocumentClick
                    open={popupCancelProject}
                    >
                    <span>
                        {(projectData.status === "cancelled-after-qualification" || projectData.status === "cancelled-before-qualification")?(
                            <Card body inverse class="popup">
                            <CardTitle id="popupbox_title" style={{textAlign:"center"}}>Le projet a déjà été annulé !</CardTitle>
                            <Button class="col popupbox_button" variant="contained" color="primary" onClick={()=> {setPopupCancelProject(false)}}>OK</Button>
                            </Card>
                        ):(
                            <Card body inverse class="popup">
                            <CardTitle class="popupbox_title" style={{textAlign:"center"}}>Annuler le projet !</CardTitle>
                            <CardText style={{textAlign:"center"}}>Merci de choisir la raison d'annulation et/ou remplir la case autre:</CardText>
                            <div class="col-12">
                                <TextField select label="Raison"
                                value={uidCancelReason}
                                SelectProps={{
                                    native: true,
                                }}
                                variant="outlined"
                                onChange={handleServiceChange} name="uid_service" onChange={(val)=>{setUidCancelReason(val.target.value)}}>
                                    <option value="-1">Choisir une raison d'annulation</option>
                                    {cancelReasonsData.map((s, i) =>
                                    (
                                    <option value={s.uid}>{s.reason_fr}</option>
                                    )
                                    )}
                                </TextField>
                            </div>
                            <i class="col-12 pt-1" style={{paddingTop:"5px"}}>Si tu ne choisis aucune raison de la liste aucun courriel ne sera envoyé automatiquement au client.</i>
                            <div class="col-12 pt-2">
                                <TextField defaultValue=" " label="Autre" variant="outlined" name="cancel_reason_message"
                                onChange={(val)=>{setMessageCancelReason(val.target.value)}} 
                                value={messageCancelReason}/>
                            </div>
                            <br/>
                            <div class="row">
                                <Button class="col ml-3 popupbox_button" variant="contained" color="primary" onClick={()=> {cancelProject()}}>Oui</Button>
                                <Button class="col ml-2 mr-3 popupbox_button" variant="contained" color="primary" onClick={()=> {setPopupCancelProject(false)}}>Annuler</Button>
                            </div>
                            </Card>
                        )}
                    </span>
                    </Popup>
                </div>
                <div class="col">
                    <img width="40px" src={email_logo} alt="Courriel" onClick={() => setPopupOpenSendQuestions(true)}></img>
                    <Popup
                    onClose={() => setPopupOpenSendQuestions(false)}
                    closeOnDocumentClick
                    open={popupOpenSendQuestions}
                    >
                    <span>
                        <Card body inverse class="popup">
                        <CardTitle class="popupbox_title" style={{textAlign:"center"}}>Envoyer un courriel avec les questions suivantes:</CardTitle>
                        <CardText class="popupbox_content">
                            {
                            generalServiceQuestionsData.map((sq, i) =>
                            (
                            <div class="col">
                                <FormControlLabel
                                    control={
                                    <Checkbox
                                        name="question" id={"question_"+sq.uid}
                                        color="primary"
                                    />
                                    }
                                    label={sq.question_fr}
                                />
                            </div>
                            )
                            )}
                            {
                            serviceQuestionsData.map((sq, i) =>
                            (
                            <div class="col">
                                <FormControlLabel
                                    control={
                                    <Checkbox
                                        name="question" id={"question_"+sq.uid}
                                        color="primary"
                                    />
                                    }
                                    label={sq.question_fr}
                                />
                            </div>
                            )
                            )}
                            <Label>Question personnalisée :</Label>
                            <Input type="textarea" value={messageSendQuestions} onChange={(val)=>{setMessageSendQuestions(val.target.value)}} />
                        </CardText>
                        <div class="col-12">
                            <Button class="popupbox_button" variant="contained" color="primary" onClick={()=> {getCheckedQuestions()}}>Envoyer</Button>
                            <Button class="popupbox_button" variant="contained" color="primary" onClick={()=> {setPopupOpenSendQuestions(false)}}>Annuler</Button>
                        </div>
                        </Card>  
                    </span>
                    </Popup>
                </div>
                <div class="col">
                    <img width="40px" src={call_back_later_logo} alt="Appeler plus tard" onClick={() => setPopupCallBackLater(true)}></img>
                    <Popup
                    onClose={() => setPopupCallBackLater(false)}
                    closeOnDocumentClick
                    open={popupCallBackLater}
                    >
                    <span>
                        <Card body inverse class="popup">
                            <CardTitle class="col-12 popupbox_title" style={{textAlign:"center"}}>Rappeler plus tard:</CardTitle>
                            <i class="col-12">Note: Le projet sera remit dans les nouveaux clients 5 min avant l'heure de rappel.</i>
                            <div class="col-12 pt-3">
                                <TextField defaultValue="2020-01-01" type="date" label="Date*" variant="outlined" name="date_callbacklater" id="date_callbacklater" />
                            </div>
                            <div class="col-12 pt-3">
                                <TextField defaultValue="00:00" type="time" label="Heure*" variant="outlined" name="date_callbacklater" id="time_callbacklater" />
                            </div>
                            <div class="col-12 pt-3">
                                <TextField defaultValue=" " fullWidth label="Commentaire / Raison" variant="outlined" name="comment_callbacklater" id="comment_callbacklater"
                                onChange={(e)=>{ setMessageCancelReason(e.target.value)}} value={messageCancelReason}/>
                            </div>
                            <br/>
                            <div class="col-12">
                                <Button class="popupbox_button" variant="contained" color="primary" onClick={() => {callBackLater()}}>Confirmer</Button>
                                <Button class="popupbox_button" variant="contained" color="primary" onClick={() => {setPopupCallBackLater(false)}}>Annuler</Button>
                            </div>
                        </Card>
                    </span>
                    </Popup>
                </div>
                <div class="col">
                    <img width="40px" src={call_logo} alt="Appeler" onClick={() => window.open('tel:'+ dialerPrefix +addressData.phone1, "_self")}></img>
                </div>
                <div class="col">
                    <img width="40px" src={google_map_logo} alt="Google Map" onClick={() => openGoogleMap()}></img>
                </div>
                <div class="col">
                    <img width="40px" src={duplicate_logo} alt="Copier" onClick={() => duplicateProject()}></img>
                </div>
                <div class="col">
                {(projectData.flag_for_review === 1)?(
                    <img width="40px" src={flag_for_review_logo_green} alt="Flag for review" onClick={() => setPopupOpenFlagForReview(true)}></img>
                ):(
                    <img width="40px" src={flag_for_review_logo} alt="Flag for review" onClick={() => setPopupOpenFlagForReview(true)}></img>
                )}
                <Popup
                    onClose={() => setPopupOpenFlagForReview(false)}
                    closeOnDocumentClick
                    open={popupOpenFlagForReview}
                    >
                {(projectData.flag_for_review === 1)?(
                    <span>
                        <Card body inverse class="popup">
                        <CardTitle class="popupbox_title" style={{textAlign:"center"}}>Le projet a déjà été signalé pour être revu !</CardTitle>
                        <Button class="col popupbox_button" variant="contained" color="primary" onClick={()=> {setPopupOpenFlagForReview(false)}}>OK</Button>
                        </Card>
                    </span>
                ):
                (
                    <span>
                    <Card body inverse class="popup">
                        <CardTitle class="popupbox_title" style={{textAlign:"center"}}>Rappeler plus tard:</CardTitle>
                        <CardText style={{textAlign:"center"}}>Etes-vous sûre de vouloir marquer ce projet pour qu'il puisse etre revu ?</CardText>
                        <br/>
                        <div class="row">
                            <Button class="col ml-3 popupbox_button" variant="contained" color="primary" onClick={()=> {flagForReview()}}>Oui</Button>
                            <Button class="col ml-2 mr-3 popupbox_button" variant="contained" color="primary" onClick={()=> {setPopupOpenFlagForReview(false)}}>Annuler</Button>
                        </div>
                    </Card>
                    </span>
                )}
                </Popup>
            </div>
                <div class="col">
                    <img width="40px" id={"hide_"+projectData.uid} src={down_arrow_icon} alt="Cacher" onClick={() => hideProject()}></img>
                </div>
            </div>
            <div class="row pt-2 pb-1">
                <div className="col">
                    <b>Status:</b> <b style={{color:"#3F51B5"}}>{projectData.status}</b>
                </div>
                <div className="col text-center">
                    <b>Date de soumission:</b> <b style={{color:"#3F51B5"}}>{projectData.sn_cdate}</b>
                </div>
                <div className="col-2 text-right">
                    <b style={{color:"#3F51B5"}}>{projectData.nb_files}</b>&nbsp;<img width="20px" src={clipart} alt="Fichiers joints" 
                    onClick={() => setPopupOpenFiles(true)} style={{cursor: "pointer"}}></img>
                    <Popup
                    onClose={() => setPopupOpenFiles(false)}
                    closeOnDocumentClick
                    open={popupOpenFiles}
                    >
                    <span>
                        <Card body inverse class="popup">
                        <CardTitle class="popupbox_title" style={{textAlign:"center"}}>Fichiers joints</CardTitle>
                        <CardText style={{textAlign:"center"}}>
                            {(projectData.file1)?(<img width="375px" alt="Ouvrir" onClick={() => window.open("https://soumissionrenovation.ca"+projectData.file1, "_blank")} src={"https://soumissionrenovation.ca"+projectData.file1} style={{cursor: "pointer"}}></img>):(null)}
                            {(projectData.file2)?(<img width="375px" alt="Ouvrir" onClick={() => window.open("https://soumissionrenovation.ca"+projectData.file2, "_blank")} src={"https://soumissionrenovation.ca"+projectData.file2} style={{cursor: "pointer"}}></img>):(null)}
                            {(projectData.file3)?(<img width="375px" alt="Ouvrir" onClick={() => window.open("https://soumissionrenovation.ca"+projectData.file3, "_blank")} src={"https://soumissionrenovation.ca"+projectData.file3} style={{cursor: "pointer"}}></img>):(null)}
                            {(projectData.file4)?(<img width="375px" alt="Ouvrir" onClick={() => window.open("https://soumissionrenovation.ca"+projectData.file4, "_blank")} src={"https://soumissionrenovation.ca"+projectData.file4} style={{cursor: "pointer"}}></img>):(null)}
                            {(projectData.file5)?(<img width="375px" alt="Ouvrir" onClick={() => window.open("https://soumissionrenovation.ca"+projectData.file5, "_blank")} src={"https://soumissionrenovation.ca"+projectData.file5} style={{cursor: "pointer"}}></img>):(null)}
                        </CardText>
                        <div class="row">
                            <Button class="col ml-3 mr-3 popupbox_button" onClick={()=> {setPopupOpenFiles(false)}}>OK</Button>
                        </div>
                        </Card>
                    </span>
                    </Popup>
                </div>
                <div className="col-2 text-right">
                    <b style={{color:"#3F51B5"}}>#{projectData.uid}</b>
                </div>
            </div>
            <div id={"tohide_"+projectData.uid} style={{display: "none"}}>
                <div class="row description">
                    <div class="col-12 description__label">
                <h6 style={{textAlign:"center"}}>Description</h6>
                </div>
                    <div class="col-12 description__editor" id={"editor_"+projectData.uid}>
                    <Editor
                        apiKey="rpg0vwsws34iize77k9uf2afya24z2f7wqq3i3rg84evn1k3" 
                        initialValue={projectData.description}
                        value={projectData.description}
                        outputFormat='html'
                        onPaste={handlePaste}
                        init={{
                        height: 400,
                        menubar: false,
                        plugins: [
                            'advlist autolink lists link image charmap print preview anchor',
                            'searchreplace visualblocks code fullscreen',
                            'insertdatetime media table paste code help wordcount'
                        ],
                        toolbar:
                            'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent table | removeformat | code help'
                        }}
                        onEditorChange={handleEditorChange}
                    />
                </div>
                    <div class="col-12">
                        <label class="btn btn-primary description__choose_file" for={"choose_file_"+projectData.uid} >Choisir une image</label>
                        <i class="description__choose_file_name">{(selectedFile.name !== undefined)?selectedFile.name:"..."}</i>
                        <button type="button" class="btn btn-success" onClick={onClickUploadFile}>Ajouter l'image</button>
                        <input type="file" name="file" style={{visibility: "hidden"}} onChange={onFileChangeHandler} id={"choose_file_"+projectData.uid}/>
                    </div>
                </div>
            <div class="row p-1">
                <div class="col second_form_info">
                    <div class="col-12 second_form_info__title">
                        <h6 style={{textAlign:"center"}}>Informations du 2ème formulaire</h6>
                    </div>
                    <Form>
                        <FormGroup>
                        <Label>Durée du projet:</Label>
                        <Input type="text" value={projectData.estimate_duration} disabled/>
                        </FormGroup>
                        <FormGroup>
                        <Label>Propriétaire:</Label>
                        <Input type="text" value={projectData.is_owner} disabled/>
                        </FormGroup>
                        <FormGroup>
                        <Label>Budget:</Label>
                        <Input type="text" value={projectData.budget} disabled/>
                        </FormGroup>
                        <FormGroup>
                        <Label>Type de budget:</Label>
                        <Input type="text" value={projectData.budget_type} disabled/>
                        </FormGroup>
                        <FormGroup>
                        <Label>Type de propriété:</Label>
                        <Input type="text" value={projectData.property_type} disabled/>
                        </FormGroup>
                        <FormGroup>
                        <Label>Préférence du type d'entrepreneur:</Label>
                        <Input type="text" value={projectData.contractor_type} disabled/>
                        </FormGroup>
                        <FormGroup>
                        <Label>Raison de la demande de soumission / Quand seriez-vous prêt à recevoir la visite d'un entrepreneur pour obtenir une soumission détaillée?</Label>
                        <Input type="text" value={projectData.quote_reason} disabled/>
                        </FormGroup>
                        <FormGroup>
                        <Label>Commentaires additionnels:</Label>
                        <Input type="text" value={projectData.additional_comments} disabled/>
                        </FormGroup>
                        <FormGroup>
                        <Label>Premier URL:</Label>
                        <Input type="text" value="" disabled/>
                        </FormGroup>
                        <FormGroup>
                        <Label>Infos Adwords:</Label>
                        <p>Region: - Keyword: - Campaign:</p>
                        <Label>Infos adresse IP:</Label>
                        <p>Region: - Rayon de confiance:</p>
                        </FormGroup>
                    </Form>
                    {(sentQuestionsAnswersData !== undefined)?
                        sentQuestionsAnswersData.map((sqa, i) => (
                            <div>
                                {
                                    sentQuestionsAnswersQData.map((q, y) =>{
                                        if (q.uid === sqa.service_question_uid){
                                            return (
                                                <Label>q.question_fr</Label>
                                            )
                                        }
                                    })
                                }
                                <Input type="text" value={sqa.answer} disabled/>
                            </div>
                        )):("")
                    }
                </div>
                <div class="col qualification">
                    <div class="col-12 qualification__title">
                        <h6 style={{textAlign:"center"}}>Qualification</h6>
                    </div>
                    <div class="col-12 ml-1">
                        <FormControlLabel
                            control={
                            <Checkbox
                                checked={(projectData.employee === "yes")?true:false}
                                onChange={handleEmployeeChange}
                                name="employee"
                                color="primary"
                            />
                            }
                            label="Employé ?"
                        />
                    </div>
                    <div class="col-12">
                        <TextField select label="Service*"
                            value={projectData.uid_service}
                            SelectProps={{
                                native: true,
                            }}
                            variant="outlined"
                            onChange={handleServiceChange} name="uid_service">
                                <option value="-1">Choisir un service</option>
                                {servicesData.map((option) => (
                                    <option key={option.uid} value={option.uid}>
                                    {option.name_long_fr}
                                    </option>
                                ))}
                        </TextField>
                    </div>
                    <div class="col-12">
                        <TextField select label="Sous-service*"
                            value={projectData.uid_subservice}
                            SelectProps={{
                                native: true,
                            }}
                            variant="outlined"
                            onChange={handleSubServiceChange} name="uid_subservice" >
                                <option value="-1">Choisir un sous-service</option>
                                {subServicesData.map((option) => (
                                    <option key={option.uid} value={option.uid}>
                                    {option.name_fr}
                                    </option>
                                ))}
                            </TextField>
                    </div>
                    <div class="col-12">
                        <TextField select label="Service secondaire"
                            value={projectData.uid_secondary_service}
                            SelectProps={{
                                native: true,
                            }}
                            variant="outlined"
                            onChange={handleSecondaryServiceChange} name="uid_service">
                                <option value="-1">Choisir un service secondaire</option>
                                {servicesData.map((option) => (
                                    <option key={option.uid} value={option.uid}>
                                    {option.name_fr}
                                    </option>
                                ))}
                        </TextField>
                    </div>
                    <div class="col-12">
                        <TextField select label="Qualité du projet"
                            value={projectData.quality}
                            SelectProps={{
                                native: true,
                            }} variant="outlined" onChange={handleQualityChange} name="quality"
                        >
                            <option value="0">Choisir une qualité</option>
                            <option value="upmarket">Haut-de-gamme</option>
                            <option value="standard">Standard</option>
                            <option value="cheap">Economique</option>
                        </TextField>
                    </div>
                    <div class="col-12 mb-3">
                        <div class="row">
                            <div class="col">
                                <TextField defaultValue=" " label="Prix*" variant="outlined" name="lead_price"
                                onChange={(e)=>{setProjectData({...projectData, lead_price: e.target.value});saveAjax("sr_project",projectData.uid, "lead_price", e.target.value)}} 
                                value={projectData.lead_price}/>
                            </div>
                            <div class="col">
                                <TextField defaultValue=" " label="Valeur estimée*" variant="outlined" name="estimated_value"
                                onChange={(e)=>{setProjectData({...projectData, estimated_value: e.target.value});saveAjax("sr_project",projectData.uid, "estimated_value", e.target.value)}} 
                                value={projectData.estimated_value}/>
                            </div>
                        </div>
                    </div>
                    <div class="col-12">
                        <TextField defaultValue=" " label="Budget partagé" variant="outlined" name="shared_budget"
                        onChange={(e)=>{setProjectData({...projectData, shared_budget: e.target.value});saveAjax("sr_project",projectData.uid, "shared_budget", e.target.value)}} 
                        value={projectData.shared_budget} helperText="ex: 1000$ à 3000$ (main d'oeuvre et materiaux)"/>
                    </div>
                    <div class="col-12">
                        <TextField select label="Type de projet*"
                            value={projectData.uid_project_type}
                            SelectProps={{
                                native: true,
                            }}
                            variant="outlined"
                            onChange={handleProjectTypeChange} name="uid_project_type">
                            <option value="0">Choisir un type</option>
                            <option value="1">Résidentiel</option>
                            <option value="2">Commercial</option>
                            <option value="4">Construction neuve</option>
                        </TextField>
                    </div>
                    <div class="col-12">
                        <TextField defaultValue=" " label="Commentaire interne" variant="outlined" name="comments"
                        onChange={(e)=>{setProjectData({...projectData, comments: e.target.value});saveAjax("sr_project",projectData.uid, "comments", e.target.value)}} 
                        value={projectData.comments}/>
                    </div>
                    <div class="col-12">
                        <TextField defaultValue=" " label="Informations additionnelles" variant="outlined" name="additional_info"
                        onChange={(e)=>{setProjectData({...projectData, additional_info: e.target.value});saveAjax("sr_project",projectData.uid, "additional_info", e.target.value)}} 
                        value={projectData.additional_info} helperText="L'entrepreneur verra ces informations apres avoir acheter le projet"/>
                    </div>
                    <div class="col-12">
                        <TextField defaultValue=" " label="Date d'échéance*" variant="outlined" name="due_date"
                        onChange={(e)=>{setProjectData({...projectData, due_date: e.target.value});saveAjax("sr_project",projectData.uid, "due_date", e.target.value)}} 
                        value={projectData.due_date}/>
                    </div>
                    <div class="col-12">
                        <TextField select label="Délais de traitement*"
                            value={projectData.delay_options}
                            SelectProps={{
                                native: true,
                            }}
                            variant="outlined"
                            onChange={handleDelayChange} name="delay_options">
                            <option value='0'>Choisir un filtre</option>
                            <option value='1'>D'ici à une semaine/Urgent</option>
                            <option value='2'>Dans 1 à 2 semaines</option>
                            <option value='3'>Dans 3 à 4 semaines</option>
                            <option value='4'>Dans 1 à 2 mois</option>
                            <option value='5'>Dans 3 à 4 mois</option>
                            <option value='6'>Dans 6 à 12 mois</option>
                            <option value='7'>Dans 12+ mois</option>
                            <option value='8'>Flexible, suivant la disponibilité de l'entrepreneur</option>
                        </TextField>
                    </div>
                    <div class="col-12 mb-3">
                        <div class="row">
                            <div class="col">
                                <TextField defaultValue="2020-01-01" type="date" label="Début" variant="outlined" name="delay_from"
                                onChange={(e)=>{setProjectData({...projectData, delay_from: e.target.value});saveAjax("sr_project",projectData.uid, "delay_from", e.target.value)}} 
                                value={projectData.delay_from}/>
                            </div>
                            <div class="col">
                                <TextField defaultValue="2020-01-01" type="date" label="Fin" variant="outlined" name="delay_to"
                                onChange={(e)=>{setProjectData({...projectData, delay_to: e.target.value});saveAjax("sr_project",projectData.uid, "delay_to", e.target.value)}} 
                                value={projectData.delay_to}/>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 mb-3">
                        <div class="row">
                            <div class="col">
                                <TextField defaultValue=" " type="phone" label="Téléphone*" variant="outlined" name="phone1"
                                onChange={(e) => {saveAjaxAddress("sr_address", projectData.uid_address, "phone1", e.target.value)}} 
                                value={addressData.phone1}/>
                            </div>
                            <div class="col">
                                <TextField defaultValue=" " type="phone" label="Autre téléphone" variant="outlined" name="phone2"
                                onChange={(e) => saveAjaxAddress("sr_address", projectData.uid_address, "phone2", e.target.value)}
                                value={addressData.phone2}/>
                            </div>
                        </div>
                    </div>
                    <div class="col-12" ref={addressRef}>
                        <TextField defaultValue=" " fullWidth label="Adresse*" variant="outlined" name="complete_address"
                        onChange={handleAddressChange} disabled={!ready}
                        value={completeAddress}/>
                        {status === "OK" && <ul>{renderSuggestions()}</ul>}
                    </div>
                    <div class="col-12 mb-3">
                        <div class="row">
                            <div class="col">
                                <TextField defaultValue=" " label="No. de rue*" variant="outlined" name="street_no"
                                onChange={(e)=>{setAddressData({...addressData, street_no: e.target.value});saveAjax("sr_address", projectData.uid_address, "street_no", e.target.value)}} 
                                value={addressData.street_no}/>
                            </div>
                            <div class="col">
                                <TextField defaultValue=" " label="Rue*" variant="outlined" name="street"
                                onChange={(e)=>{setAddressData({...addressData, street: e.target.value});saveAjax("sr_address", projectData.uid_address, "street", e.target.value)}} 
                                value={addressData.street}/>
                            </div>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="row">
                            <div class="col">
                                <TextField defaultValue=" " label="Code postal*" variant="outlined" name="zip"
                                onChange={(e)=>{setAddressData({...addressData, zip: e.target.value});saveAjax("sr_address", projectData.uid_address, "zip", e.target.value)}} 
                                value={addressData.zip}/>
                            </div>
                            <div class="col">
                                <TextField select label="Ville*"
                                    value={addressData.uid_city}
                                    SelectProps={{
                                        native: true,
                                    }}
                                    variant="outlined"
                                    onChange={handleCityChange} name="uid_city">
                                        <option value="-1">Choisir une ville</option>
                                        {cityData.map((option) => (
                                            <option key={option.uid} value={option.uid}>
                                            {option.name_fr}
                                            </option>
                                        ))}
                                </TextField>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}

export default Project