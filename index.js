#!/usr/bin/env node

import searchBranches from './src/search-branches.js';
import {setConfigs} from './src/github-request.js';

function findArgs() {
    let token = undefined;
    let owner = undefined;
    let repo = undefined;
    
    process.argv.forEach(arg => {
        if (arg.includes('token')) {
            token = arg.split('=')[1];
        } else if (arg.includes('owner')) {
            owner = arg.split('=')[1];
        } else {
            repo = arg.split('=')[1];
        }
    })

    validateArgs(token, owner, repo);
}

function validateArgs(token, owner, repo) {
    if (!token) {
        throw Error('Option --token is required.')
    } else if (!owner) {
        throw Error('Option --owner is required.')
    } else if (!repo) {
        throw Error('Option --repo is required.')
    }

    setConfigs(token, repo, owner);
    searchBranches();
}

findArgs();
