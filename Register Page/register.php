<?php
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $username = $_POST['username'];
  $email = $_POST['email'];
  $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

  $sql = "INSERT INTO users (username, email, password) VALUES ('$username', '$email', '$password')";
  
  if ($conn->query($sql) === TRUE) {
    echo "<script>alert('Registration successful!');window.location='login.html';</script>";
  } else {
    echo "Error: " . $conn->error;
  }
}
$conn->close();
?>
