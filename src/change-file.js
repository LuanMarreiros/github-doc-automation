const { type } = require('os');
const path = require('path');
const http = require('./github-request');


function chooseNewTagNumber(commits, lastTag) {
    let newTagNumber = '';

    if (lastTag && lastTag.split('.').length === 3) {
        commits.forEach(commit => {
            if (commit.toLowerCase().includes('feature')) {
                newTagNumber = `${parseInt(lastTag.split('.')[0]) + 1}.0.0`
            } else if (commit.toLowerCase().includes('adicionado')) {
                newTagNumber = `${lastTag.split('.')[0]}.${parseInt(lastTag.split('.')[1]) + 1}.0`
            } else {
                newTagNumber = `${lastTag.split('.')[0]}.${lastTag.split('.')[1]}.${parseInt(lastTag.split('.')[2]) + 1}`
            }
        });
    } else {
        newTagNumber = '1.0.0';
    }

    return newTagNumber;
}

function getTodayDate() {
    const date = new Date();
    const day = date.getDate() < 9 ? "0" + date.getDate() : date.getDate();
    const month = (date.getMonth() + 1) < 9 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
    const year = date.getFullYear() < 9 ? "0" + date.getFullYear() : date.getFullYear();

    return `${year}-${month}-${day}`
}

function organizeMessages(commits) {
    const types = {};

    commits.forEach(commit => {
        if (commit.includes(":")) {
            if (types.hasOwnProperty(commit.split(":")[0].toLowerCase())) {
                types[commit.split(":")[0].toLowerCase()].push(commit.split(":")[1])
            } else {
                types[commit.split(":")[0].toLowerCase()] = [commit.split(":")[1]];
            }
        } else {
            if (types.hasOwnProperty('outros')) {
                types["outros"].push(commit.split(":")[0])
            } else {
                types["outros"] = [commit.split(":")[0]];
            }
        }
    })

    return types;
}

function createMessageToChangeLog(commits, branch, lastTag, actualFile) {
    const newTag = chooseNewTagNumber(commits, lastTag)
    const messages = organizeMessages(commits);
    const typeMessages = Object.keys(messages);
    let newMessageComplete = `# [${newTag}]() - ${getTodayDate()}`;
    let newMessage;

    if (actualFile) {
        typeMessages.forEach(type => {
            newMessageComplete += `\n\n## ${type.charAt(0).toUpperCase() + type.slice(1)}:\n`;
            messages[type].forEach(message => {
                newMessageComplete += '\n- ' + (`${message}`.charAt(0) === ' ' ? `${message}`.slice(1) : message);
            })
        })

        newMessage = newMessageComplete;

        newMessageComplete += '\n\n' + actualFile;
    } else {
        typeMessages.forEach(type => {
            newMessageComplete += `\n\n## ${type.charAt(0).toUpperCase() + type.slice(1)}:\n`;
            messages[type].forEach(message => {
                newMessageComplete += '\n- ' + (`${message}`.charAt(0) === ' ' ? `${message}`.slice(1) : message);
            })
        })

        newMessage = newMessageComplete;
    }

    return { complete: newMessageComplete, new: newMessage, newTag: newTag };
}


function createMessageToTag(commits, branch, lastTag, actualFile) {
    const newTag = chooseNewTagNumber(commits, lastTag)
    const messages = organizeMessages(commits);
    const typeMessages = Object.keys(messages);
    let newMessageComplete = `${newTag} - ${getTodayDate()}`;
    let newMessage;

    if (actualFile) {
        typeMessages.forEach(type => {
            newMessageComplete += `\n\n ${type.charAt(0).toUpperCase() + type.slice(1)}:\n`;
            messages[type].forEach(message => {
                newMessageComplete += '\n• ' + (`${message}`.charAt(0) === ' ' ? `${message}`.slice(1) : message);
            })
        })

        newMessage = newMessageComplete;

        newMessageComplete += '\n\n' + actualFile;
    } else {
        typeMessages.forEach(type => {
            newMessageComplete += `\n\n ${type.charAt(0).toUpperCase() + type.slice(1)}:\n`;
            messages[type].forEach(message => {
                newMessageComplete += '\n• ' + (`${message}`.charAt(0) === ' ' ? `${message}`.slice(1) : message);
            })
        })

        newMessage = newMessageComplete;
    }

    return { complete: newMessageComplete, new: newMessage, newTag: newTag };
}

function editChangeLog(commits, branch, lastTag, sha) {
    const fs = require('fs');
    const actualFile = fs.readFileSync('./CHANGELOG.MD', 'utf-8');
    const messageToSave = createMessageToChangeLog(commits, branch, lastTag, actualFile);
    const messageToTag = createMessageToTag(commits, branch, lastTag, actualFile);

    fs.writeFile('CHANGELOG.MD', messageToSave.complete, function (err) {
        if (err) throw err;

        createTag(messageToTag, sha, branch);
    });
}

function createTag(messageToSave, sha, branch) {
    const dataTag = {
        owner: 'LuanMarreiros',
        repo: 'gihub-teste',
        tag: messageToSave.newTag,
        message: messageToSave.new,
        object: sha,
        type: 'commit',
        tagger: {
            name: 'LuanMarreiros',
            email: 'luan.marreiros@hotmail.com',
            date: '2022-10-06T11:41:35-03:00'
        }
    }

    http.post(`/git/tags`, dataTag).then(data => {
        confirmTag(data.data.sha, messageToSave.newTag, branch, messageToSave.newMessageComplete)
    }).catch(err => {
        throw Error(`Rota: /git/tags, status: ${err?.response?.status}`)
    })
}

function confirmTag(sha, tag, branch, message) {
    const dataRef = {
        ref: "refs/tags/" + tag,
        sha: sha
    }
    http.post('/git/refs', dataRef).then(data => {
        createRelease(tag, branch, message);
    }).catch(err => {
        throw Error(`Rota: /git/refs, status: ${err?.response?.status}`)
    })
}

function createRelease(tag, branch, message) {
    const dataRelease = {
        owner: 'LuanMarreiros',
        repo: 'gihub-teste',
        tag_name: tag,
        target_commitish: branch,
        name: tag,
        body: message,
        draft: false,
        prerelease: false,
        generate_release_notes: false
    }
    http.post('/releases', dataRelease).then(data => {
        console.log("Tag and Release created with name: " + tag)
    }).catch(err => {
        throw Error(`Rota: /git/refs, status: ${err?.response?.status}`)
    })
}

module.exports = { editChangeLog }