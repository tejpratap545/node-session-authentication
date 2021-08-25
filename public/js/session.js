const baseUrl = window.location.origin;

async function deleteSession(session) {
  console.log("come");
  fetch(`${baseUrl}/api/session/${session.id}`, {
    method: "Delete",
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      if (json.status == "success") {
        window.location.href = "/";
      }
    });
}
