import axios from 'axios';

let token = '';
let repo = '';
let owner = '';

function get(url) {
    return axios.get(`https://api.github.com/repos/${owner}/${repo}` + url, {
        headers: {
            "Authorization": "Bearer " + token,
            "Accept": "application/vnd.github+json"
        }
    });
}

function post(url, data) {
    return axios.post(`https://api.github.com/repos/${owner}/${repo}` + url, data, {
        headers: {
            "Authorization": "Bearer " + token,
            "Accept": "application/vnd.github+json"
        }, 
    });
}

function setConfigs(_token, _repo, _owner){
    token = _token;
    repo = _repo;
    owner = _owner;
}

export {get, post, setConfigs};