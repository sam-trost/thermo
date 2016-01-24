var ThermoReadings = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  loadThermoReadingsFromServer: function(filter) {
    $.get(this.props.url, { filter: filter })
       .success(function(data){
         this.setState({data: data});
       }.bind(this))
       .error(function(err){
         console.log(this.props.url, status, err.toString());
       }.bind(this));
  },
  handleThermoReadingSubmit: function(reading) {
    var thermoReadings = this.state.data;
    // Optimistically set an id on the new comment. It will be replaced by an
    // id generated by the server. In a production application you would likely
    // not use Date.now() for this and would have a more robust system in place.
    reading.capture_date = Date.now();
     
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: reading,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: thermoReadings});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });   
     
    reading.capture_date = new Date().toString();
    var newReadings = thermoReadings.concat([reading]);
    this.setState({data: newReadings});
  },
  componentDidMount: function() {
    this.loadThermoReadingsFromServer(null);
  },
  onRefresh: function(e) {
    this.loadThermoReadingsFromServer(this.state.filter);
  },
  handleFilterChange: function(e) {
    this.setState({filter: e.target.value}); 
  },
  render: function() {
    return (
      <div className="container-fluid">
        <h1>Thermo Readings</h1>  
        <div className="row">
           <div className="col-sm-9">
              <div className="panel panel-default">
                <div className="panel-heading">
                  Filter
                </div>
                <div className="panel-body form-inline">
                   <div className="form-group">
                     <input type="text" className="form-control" 
                        placeholder="Enter a date filter..." 
                        value={this.state.filter} 
                        onChange={this.handleFilterChange} />
                   </div>
                   <input type="button" className="btn btn-default" onClick={this.onRefresh} value="Refresh" />
                </div>
              </div>
           </div>
           <div className="col-sm-3">
             <ManualReadingForm onFormSubmit={this.handleThermoReadingSubmit} />
           </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
             <ReadingList data={this.state.data} />
          </div>
        </div>
      </div>
    );
  }
});

var ManualReadingForm = React.createClass({
   getInitialState: function() {
      return {reading: ''};
   },
   handleReadingChange: function(e) {
      this.setState({thermoValue: e.target.value});
   },
   handleSubmit: function(e) {
      var reading = this.state.thermoValue;
      e.preventDefault();

      if (!reading) {
         return;
      }

      this.props.onFormSubmit({capture_date: new Date(), thermo_value: reading});
      this.setState(this.getInitialState());
   },
   onRefresh: function(e){
      e.preventDefault();
      
      $.get(this.props.url)
      .success(function(data){
         this.setState({reading: data})})
      .error(function(data){
         console.error(this.props.url, status, err.toString());
      });
   },
   render: function() {
      return (
         <div className="panel panel-default">
            <div className="panel-heading">Manual Reading</div>
            <form className="panel-body" onSubmit={this.handleSubmit}>
               <div className="form-inline">
                  <div className="form-group">
                     <div className="input-group"> 
                        <input
                        id="txtThermoReading"
                        className="form-control"
                        type="text"
                        placeholder="Enter Reading..."
                        value={this.state.thermoValue}
                        onChange={this.handleReadingChange} />       
                        <div className="input-group-btn" title="Get value from thermocouple">
                           <button className="btn btn-success" onClick={this.onRefresh}>
                              <span className="fa fa-rss" />
                           </button>
                        </div>
                     </div>
                  </div>
               </div>      
            </form>
            <div className="panel-footer">
               <span>
                  <button type="submit" className="btn btn-primary" onClick={this.handleSubmit}>
                     <span className="glyphicon glyphicon-cloud-upload"/>
                  </button>
               </span>
            </div>
         </div>
      );
   }
});

var ReadingChart = React.createClass({
   render: function (){
   }
});

var ReadingList = React.createClass({
  render: function() {
    var nodes = this.props.data.map(function(reading) {
      return (
        <Reading key={reading.id} thermoValue={reading.thermo_value} captureDate={reading.capture_date} />
      );
    });
     
    return (
       <table className="table table-default">
          <thead>
             <tr>
                <th>Time</th>
                <th>Reading</th>
             </tr>
          </thead>
          <tbody>
             {nodes}
          </tbody>
       </table>
    );
  }
});

var Reading = React.createClass({
  render: function() {
    return (
       <tr>
          <td>
             <span>{this.props.captureDate}</span>
           </td>
       
           <td>
              <span>{this.props.thermoValue}</span>
           </td>
       </tr>
    );
  }
});

ReactDOM.render(
  <ThermoReadings url="/api/thermoReadings" pollInterval="10000" />,
  document.getElementById('content')
);