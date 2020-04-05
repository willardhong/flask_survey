Survey
    .StylesManager
    .applyTheme("modern");
/*
var json = {
    title: "Skill Survey",
    showProgressBar: "bottom",
    firstPageIsStarted: true,
    startSurveyText: "Start Survey",
    pages: [
        {
            questions: [
                {
                    type: "html",
                    html: "You are about to start your skill inventory. <br> Please click on <b>'Start Survey'</b> button when you are ready."
                }
            ]
        }, {
            questions: [
                {
                    type: "radiogroup",
                    name: "Python",
                    title: "Python",
                    choices: [
                        "Master", "Practitioner", "Learner", "Not Relevant"
                    ]//,
                    //correctAnswer: "Learner"
                }
            ]
        }, {
            questions: [
                {
                    type: "radiogroup",
                    name: "R",
                    title: "R",
                    choices: [
                        "Master", "Practitioner", "Learner", "Not Relevant"
                    ]//,
                    //correctAnswer: " Learner"
                }
            ]
        }, {
            questions: [
                {
                    type: "radiogroup",
                    name: "Consulation",
                    title: "Consultation",
                    choices: [
                          "Master", "Practitioner", "Learner", "Not Relevant"
                    ]//,
                    //correctAnswer: "Learner"
                }
            ]
        }
    ],
    completedHtml: "<h4>Thank You!</h4>"
};
*/
window.survey = new Survey.Model(json);

survey
    .onComplete
    .add(function (result) {

        //document
        //    .querySelector('#surveyResult')
        //    .textContent = "Result JSON:\n" + JSON.stringify(result.data, null, 3);

        var url =  origin + '/api/polls';
       //console.log("i am here... " + JSON.stringify(result.data, null, 3));
        var json_payload = result.data;
        // make patch request
        $.ajax({
          url: url,
          dataType: 'json',
          type: 'POST',
          data: JSON.stringify(json_payload, null, 3),
          contentType: 'application/json; charset=utf-8',
          success: function(data){
            alert(data.message);
            //this.setState({selected_option: ''});
          }.bind(this),
          error: function(xhr, status, err){
            alert('Survey creation failed: ' + err.toString());
          }.bind(this)
        });

    });
//var url= "logout";
//window.location = url;
console.log("i am here checking");
$("#surveyElement").Survey({model: survey});
