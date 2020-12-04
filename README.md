# VSCode Gorls — CS171 Final Project
### Our Industry Can Do Better: Gender and Mental Health in Tech
*Sarah Yoon, Cecilia Baek, Linda Lee*

Visit [this link](https://syoon123.github.io/vscode-gorls/) to see our finished product! [Click here](https://docs.google.com/document/d/19kUOhhXsnuqb9FnSOJ8zu4sKt5CXJ2--F3wJn1ZjRLs/edit#heading=h.5mg2zsafru3q) to read our process book, and [click here](https://drive.google.com/file/d/1R9VY-l34CrhlB8uu87p2-ZVsbELp-83V/view?usp=sharing) to watch our demo.

---

***Repository contents:***
- `css/` The CSS for this project was implemented using Bootstrap and our own personal CSS code. All CSS code can be found in the CSS folder. 
- `data/` All data used was obtained from [Open Sourcing Mental Illness (OSMI)](https://osmihelp.org/). More specifically, we used OSMI’s Mental Health in Tech Surveys from 2014, 2016, 2017, 2018, and 2019. The CSV files for these surveys can be found in our data folder along with the CSV files for the cleaned versions of each survey. We cleaned the survey data using our own Python program that iterates over each survey response and standardizes the gender responses.  
- `img/` Cover image from [Teen Vogue](https://www.teenvogue.com/story/ways-you-might-be-perpetuating-mental-health-stigma)
- `js/` All Javascript files used to create our visualizations and main interface. We utilized the JavaScript D3 library to build our visualizations. 
- `index.html`

*Note: We utilized the boilerplate provided by CS 171 to implement the skeleton for our website.*
 
***A note on the interface:***

Some features of our interface not explicitly mentioned in the screencast are the ability to navigate to any section in the story using the “Skip to a topic/visualization” dropdown in the navbar in addition to a link to our code’s Github repository in the upper righthand corner on the navbar. Each visualization allows for interactivity with the user, from tooltips to hovering to additional filtering by either company size or year.
