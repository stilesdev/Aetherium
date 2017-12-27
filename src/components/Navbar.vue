<template>
    <div id="app">
        <nav class="navbar navbar-default">
            <div class="container-fluid">
                <!-- Brand and toggle get grouped for better mobile display -->
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#header-navbar-collapse" aria-expanded="false">
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <a class="navbar-brand" href="#">Aetherium</a>
                </div>

                <!-- Collect the nav links, forms, and other content for toggling -->
                <div class="collapse navbar-collapse" id="header-navbar-collapse">
                    <ul class="nav navbar-nav">
                        <li id="timer" v-bind:class="{ active: activeTab === 'timer' }" v-on:click="activeTab = 'timer'">
                            <a href="#">Timer</a>
                        </li>
                        <li id="stats" v-bind:class="{ active: activeTab === 'stats' }" v-on:click="activeTab = 'stats'">
                            <a href="#">Stats</a>
                        </li>
                        <li id="history" v-bind:class="{ active: activeTab === 'history' }" v-on:click="activeTab = 'history'">
                            <a href="#">History</a>
                        </li>
                    </ul>

                    <form class="navbar-form navbar-left" v-if="puzzles">
                        <div class="form-group">
                            <select class="form-control" v-model="activePuzzle">
                                <option v-for="puzzle in puzzles" v-bind:value="puzzle.key">{{ puzzle.name }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <select class="form-control" v-model="activeCategory">
                                <option v-for="category in puzzles[activePuzzle].categories" v-bind:value="category.key">{{ category.name }}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <button type="button" class="btn btn-primary" v-on:click="onCloseSessionClick">Close Session</button>
                        </div>
                    </form>

                    <ul class="nav navbar-nav navbar-right">
                        <li class="dropdown">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                <span class="glyphicon glyphicon-cog"></span>
                                <span class="caret"></span>
                            </a>
                            <ul class="dropdown-menu">
                                <li><a href="#" v-on:click="openOptionsModal">Options</a></li>
                                <li><a href="#" v-on:click="openImportModal">Import</a></li>
                                <li role="separator" class="divider"></li>
                                <li><a href="#" v-on:click="logout">Logout</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <!-- Close Session Modal -->
        <div class="modal fade" id="closeSessionModal" tabindex="-1" role="dialog" aria-labelledby="closeSessionModalLabel">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title" id="closeSessionModalLabel">Close Session</h4>
                    </div>

                    <div class="modal-body">
                        <form class="form-inline">
                            <div class="form-group">
                                <p>Are you sure you would like to close the current session?</p>
                            </div>
                            <div class="form-group">
                                <label for="sessionDatePicker">Session Date:</label>
                                <date-picker id="sessionDatePicker" v-model="sessionDate" :config="datePickerConfig"></date-picker>
                            </div>
                        </form>

                        <!-- TODO: Add quick summary of session stats for each puzzle -->
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" data-dismiss="modal" v-on:click="onCloseSessionConfirm">Close Session</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Options Modal -->
        <div class="modal fade" id="optionsModal" tabindex="-1" role="dialog" aria-labelledby="optionsModalLabel">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title" id="optionsModalLabel">Options</h4>
                    </div>

                    <div class="modal-body">
                        <label for="showTimerOptionsGroup">Timer Display</label>
                        <div class="btn-group" id="showTimerOptionsGroup" data-toggle="buttons">
                            <label class="btn btn-default" v-bind:class="{ 'active': showTimer }" v-on:click="showTimer = true">
                                <input type="radio" name="timerDisplayOptions" id="showTimer" autocomplete="off"/>Show
                            </label>
                            <label class="btn btn-default" v-bind:class="{ 'active': !showTimer }" v-on:click="showTimer = false">
                                <input type="radio" name="timerDisplayOptions" id="hideTimer" autocomplete="off"/>Hide
                            </label>
                        </div>

                        <hr/>

                        <label for="timerTriggerOptionsGroup">Timer Trigger</label>
                        <div class="btn-group" id="timerTriggerOptionsGroup" data-toggle="buttons">
                            <label class="btn btn-default" v-bind:class="{ 'active': timerTrigger === 'spacebar' }" v-on:click="timerTrigger = 'spacebar'">
                                <input type="radio" name="timerTriggerOptions" id="spacebarTimerTrigger" autocomplete="off"/>Spacebar
                            </label>
                            <label class="btn btn-default" v-bind:class="{ 'active': timerTrigger === 'stackmat' }" v-on:click="timerTrigger = 'stackmat'">
                                <input type="radio" name="timerTriggerOptions" id="stackmatTimerTrigger" autocomplete="off"/>Stackmat
                            </label>
                        </div>

                        <hr/>

                        <div class="form-group form-inline">
                            <label for="themeSelector">Theme</label>
                            <select class="form-control" id="themeSelector" v-model="themeUrl">
                                <option v-for="theme in themes" v-bind:value="theme.url">{{ theme.name }}</option>
                            </select>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" data-dismiss="modal" v-on:click="onOptionsModalSave">Save</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Import Modal -->
        <div class="modal fade" id="importModal" tabindex="-1" role="dialog" aria-labelledby="importModalLabel">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title" id="importModalLabel">Import</h4>
                    </div>

                    <div class="modal-body">
                        <p>Example Input:</p>
                        <pre><code>{{ JSON.stringify({
                            "M/D/YYYY": {
                                "puzzle": {
                                    "category": [
                                        {
                                            "penalty": "",
                                            "scramble": "",
                                            "time": 0,
                                            "timestamp": 1234567890000
                                        }
                                    ]
                                }
                            }
                        }, undefined, 2) }}
                        </code></pre>
                        <div class="form-group" v-bind:class="{ 'has-error': !importTextValid, 'has-success': importTextValid }">
                            <textarea class="form-control" v-on:input="validateImportText" v-model="importText"></textarea>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" data-dismiss="modal" v-on:click="runImport">Import</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script src="./Navbar.js"></script>
<style>
    pre {
        text-align: left;
    }
    .modal-body textarea {
        width: 100%;
        height: 25vh;
    }
</style>