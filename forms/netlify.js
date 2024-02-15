// handle form submission to netlify
const handleSubmit = (event) => {
    event.preventDefault();

    const myForm = event.target;
    const formData = new FormData(myForm);
    
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    })
      .then(() => console.log("Form successfully submitted"))
      .catch((error) => alert(error));
  };
  
  document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form[data-netlify='true']");
    if (form) {
        form.addEventListener("submit", handleSubmit);
    } else {
        console.error("No form with data-netlify='true' attribute found.");
    }
});