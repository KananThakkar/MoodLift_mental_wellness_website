<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "sgp_db"; // make sure this is your DB name in phpMyAdmin

$conn = new mysqli($servername, $username, $password, $dbname);

// Connection check
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Only run when form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $username = mysqli_real_escape_string($conn, $_POST['username']);
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $sql = "INSERT INTO users (username, email, password) VALUES ('$username', '$email', '$password')";

    if ($conn->query($sql) === TRUE) {
        echo "<script>
                alert('✅ Registration successful!');
                window.location.href = 'Login Page/login.html';
              </script>";
    } else {
        echo "<script>
                alert('❌ Error saving data: " . $conn->error . "');
                window.history.back();
              </script>";
    }
}

$conn->close();
?>

