<?php
session_start();
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $email = $_POST['email'];
  $password = $_POST['password'];

  $sql = "SELECT * FROM users WHERE email='$email'";
  $result = $conn->query($sql);

  if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    if (password_verify($password, $row['password'])) {
      $_SESSION['username'] = $row['username'];
      header("Location: home.html");
    } else {
      echo "<script>alert('Invalid password');window.location='login.html';</script>";
    }
  } else {
    echo "<script>alert('User not found');window.location='login.html';</script>";
  }
}
$conn->close();
?>
