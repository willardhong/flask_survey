// css style to align text to the center of it's container
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var browserHistory = ReactRouter.browserHistory
try {
  var SimpleTimePicker = ReactSimpleTimePicker.SimpleTimePicker;
}catch(err){
  console.log(err);
}
var Align = {
  textAlign: 'center',
  fontFamily: 'EB Garamond'
};

var PollForm = React.createClass({
  getInitialState: function(){
    // set initial state of form inputs
    return {title: '', option: '', options: []}
  },
  handleTitleChange: function(e){
    //change title as the user types
    this.setState({title: e.target.value});
  },
  handleOptionChange: function(e){
    this.setState({option: e.target.value});
  },
  handleOptionAdd: function(e){
    //update poll options and reset options to an empty string
    this.setState({
    options: this.state.options.concat({name: this.state.option}),
    option: ''
    });
  },

  //global variable to store origin url (e.g http://localhost:5000)
  //var origin = window.location.origin;

  handleSubmit: function(e){
    //TODO handle form submit
    e.preventDefault();
    var title = this.state.title;
    var options = this.state.options;

    var data = {'title': title, options: options.map(function(x){return x.name})};
    var url =  origin + '/api/polls'

    // make post request
    $.ajax({
      url: url,
      dataType: 'json',
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json; charset=utf-8',
      success: function(data){
        alert(data.message);
      }.bind(this),
      error: function(xhr, status, err){
        alert('Poll creation failed: ' + err.toString());
      }.bind(this)
    });
  },

  render: function(){
    return (
    <div>
      <form id="poll_form" className="form-signin" onSubmit={this.handleSubmit}>
        <h2 className="form-signin-heading" style={Align}>Create a skill</h2>

        <div className="form-group has-success">
          <label htmlFor="title" className="sr-only">Title</label>
          <input type="text" id="title" name="title" className="form-control" placeholder="Title" onChange={this.handleTitleChange} required autoFocus />
        </div>

        <div className="form-group has-success">
          <label htmlFor="option" className="sr-only">Option</label>
          <input type="text" id="option" name="option" className="form-control" placeholder="Option" onChange={this.handleOptionChange}
          value={this.state.option ? this.state.option: ''} required autoFocus />
        </div>

        <div className="row form-group">
          <button className="btn btn-lg btn-success btn-block" type="button" onClick={this.handleOptionAdd}>Add option</button>
          <button className="btn btn-lg btn-success btn-block" type="submit">Save survey</button>
        </div>
        <br />
      </form>

      <h3 style={Align}>Live Preview</h3>
      <LivePreview title={this.state.title} options={this.state.options} />
    </div>
    );
  }
});

var LivePreviewProps = React.createClass({

  voteHandler: function(data){

    var url =  origin + '/api/poll/vote'

    // make patch request
    $.ajax({
      url: url,
      dataType: 'json',
      type: 'PATCH',
      data: JSON.stringify(data),
      contentType: 'application/json; charset=utf-8',
      success: function(data){
        alert(data.message);
        this.setState({selected_option: ''});
        this.props.loadPollsFromServer();
      }.bind(this),
      error: function(xhr, status, err){
        alert('Poll creation failed: ' + err.toString());
      }.bind(this)
    });

  },


  render: function(){
    var polls = this.props.polls.Polls.map(function(poll){
      return (
        <LivePreview key={poll.title} title={poll.title} options={poll.options}
        total_vote_count={poll.total_vote_count} voteHandler={this.voteHandler}
        classContext={this.props.classContext} />
    );
  }.bind(this));

    return (
      <div>
        <h1 style={Align}>{this.props.header}</h1>
        <br />
        <div className="row">{polls}</div>
      </div>
    );
  }
});

var AllPolls = React.createClass({

  getInitialState: function(){
    return {polls: {'Polls': []}, header: '', classContext: ''};
  },

  loadPollsFromServer: function(){

    var url =  origin + '/api/polls'
    this.setState({header: 'Latest polls', classContext: 'col-sm-6'})

    //make get request
    $.ajax({
      url: url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({polls: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(url, status, err.toString());
      }.bind(this)
    });
  },

  componentDidMount: function(){
    this.loadPollsFromServer()
  },

  render: function(){
    <LivePreviewProps polls={this.state.polls} loadPollsFromServer={this.loadPollsFromServer}
    header={this.state.header} classContext={this.state.classContext} />
  }

});

var LivePreview = React.createClass({

  getInitialState: function(){
    return {selected_option: '', disabled: 0};
  },

  handleOptionChange: function(e){
    this.setState({selected_option: e.target.value });
  },


  voteHandler: function(e){
    e.preventDefault();

    // build the json data
    var data = {"poll_title": this.props.title, "option": this.state.selected_option};

    //calls props handler
    this.props.voteHandler(data);

    //disable the button
    this.setState({disabled: 1});

  },

  render: function(){
    var options = this.props.options.map(function(option){

      if(option.name) {
        return (
          <div key={option.name}>
            <input name="options" type="radio" value={option.name} onChange={this.handleOptionChange} /> {option.name}             <br />
          </div>
        );
      }
    }.bind(this));

    return(
      <div className="panel panel-success">
        <div className="panel-heading">
          <h4>{this.props.title}</h4>
        </div>
        <div className="panel-body">
          <form onSubmit={this.voteHandler}>
            {options}
            <br />
            <button type="submit" disabled={this.state.disabled} className="btn btn-success btn-outline hvr-grow">Vote!</button> <small>{this.props.total_vote_count} votes so far</small>
          </form>
        </div>
      </div>
    )
  }
});

ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={AllPolls} />
    <Route path="/polls" component={PollForm} />
    <Route path="/polls/:pollName" component={AllPolls} />
  </Router>
  ),
  document.getElementById('container')
);
