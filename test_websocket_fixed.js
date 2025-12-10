const jwt = require('jsonwebtoken');
const { io } = require('socket.io-client');

// Configuration
const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';
const GATEWAY_URL = 'http://localhost:3000';

// Test user data
const testUser = {
  id: '123',
  email: 'test@example.com',
  role: 'rider'
};

// Generate valid JWT token
const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '1h' });
console.log('Generated test token for testing');

// Test results
let testsPassed = 0;
let testsFailed = 0;

function logTest(testName, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testName}${message ? ': ' + message : ''}`);
  if (passed) testsPassed++;
  else testsFailed++;
}

// Helper function to wait for room join
function joinRideWithCallback(socket, rideId) {
  return new Promise((resolve) => {
    socket.emit('join_ride', { rideId }, (response) => {
      if (response?.success) {
        console.log(`Socket joined room: ${rideId}`);
        resolve(true);
      } else {
        console.log(`Socket failed to join room: ${rideId}`);
        resolve(false);
      }
    });
  });
}

// Test 1: WebSocket Connection Establishment
async function testConnection() {
  return new Promise((resolve) => {
    console.log('\n=== Testing WebSocket Connection ===');

    const socket = io(GATEWAY_URL, {
      auth: { token },
      transports: ['websocket'],
      timeout: 5000,
    });

    socket.on('connect', () => {
      logTest('WebSocket Connection', true, `Connected with user ID: ${socket.id}`);
      socket.disconnect();
      resolve(true);
    });

    socket.on('connect_error', (error) => {
      logTest('WebSocket Connection', false, `Connection failed: ${error.message}`);
      resolve(false);
    });

    setTimeout(() => {
      if (!socket.connected) {
        logTest('WebSocket Connection', false, 'Connection timeout');
        socket.disconnect();
        resolve(false);
      }
    }, 5000);
  });
}

// Test 2: Room Management
async function testRoomManagement() {
  return new Promise((resolve) => {
    console.log('\n=== Testing Room Management ===');

    const socket = io(GATEWAY_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    let joinSuccess = false;
    let leaveSuccess = false;

    socket.on('connect', async () => {
      // Test joining room with callback
      joinSuccess = await joinRideWithCallback(socket, 'test-ride-123');

      // Wait a bit then leave
      setTimeout(async () => {
        socket.emit('leave_ride', { rideId: 'test-ride-123' }, (response) => {
          leaveSuccess = response?.success || false;
          logTest('Room Join/Leave', joinSuccess && leaveSuccess);
          socket.disconnect();
          resolve(joinSuccess && leaveSuccess);
        });
      }, 500);
    });
  });
}

// Test 3: Event Broadcasting
async function testEventBroadcasting() {
  return new Promise(async (resolve) => {
    console.log('\n=== Testing Event Broadcasting ===');

    const socket1 = io(GATEWAY_URL, { auth: { token }, transports: ['websocket'] });
    const socket2 = io(GATEWAY_URL, { auth: { token }, transports: ['websocket'] });

    let broadcastReceived = false;
    let socket1Joined = false;
    let socket2Joined = false;

    socket1.on('connect', async () => {
      socket1Joined = await joinRideWithCallback(socket1, 'broadcast-test-123');
    });

    socket2.on('connect', async () => {
      socket2Joined = await joinRideWithCallback(socket2, 'broadcast-test-123');

      // Wait for both sockets to join before sending event
      const checkReady = () => {
        if (socket1Joined && socket2Joined) {
          // Send location update from socket2
          setTimeout(() => {
            socket2.emit('location_update', {
              rideId: 'broadcast-test-123',
              latitude: 23.8103,
              longitude: 90.4125,
              heading: 45,
              speed: 30,
              timestamp: new Date().toISOString()
            });
          }, 200); // Small delay to ensure room sync
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });

    socket1.on('driver_location', (data) => {
      if (data.rideId === 'broadcast-test-123') {
        broadcastReceived = true;
        logTest('Event Broadcasting', true, 'Location update received by other client');
      }
    });

    setTimeout(() => {
      socket1.disconnect();
      socket2.disconnect();
      if (!broadcastReceived) {
        logTest('Event Broadcasting', false, 'Broadcast not received');
      }
      resolve(broadcastReceived);
    }, 3000);
  });
}

// Test 4: Chat Messages
async function testChatMessages() {
  return new Promise(async (resolve) => {
    console.log('\n=== Testing Chat Messages ===');

    const socket1 = io(GATEWAY_URL, { auth: { token }, transports: ['websocket'] });
    const socket2 = io(GATEWAY_URL, { auth: { token }, transports: ['websocket'] });

    let messageReceived = false;
    let socket1Joined = false;
    let socket2Joined = false;

    socket1.on('connect', async () => {
      socket1Joined = await joinRideWithCallback(socket1, 'chat-test-123');
    });

    socket2.on('connect', async () => {
      socket2Joined = await joinRideWithCallback(socket2, 'chat-test-123');

      // Wait for both sockets to join before sending message
      const checkReady = () => {
        if (socket1Joined && socket2Joined) {
          setTimeout(() => {
            socket2.emit('send_message', {
              rideId: 'chat-test-123',
              receiverId: 'user-456',
              message: 'Test message',
              timestamp: new Date().toISOString()
            });
          }, 200);
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });

    socket1.on('new_message', (message) => {
      if (message.rideId === 'chat-test-123' && message.message === 'Test message') {
        messageReceived = true;
        logTest('Chat Messages', true, 'Message received by other client');
      }
    });

    setTimeout(() => {
      socket1.disconnect();
      socket2.disconnect();
      if (!messageReceived) {
        logTest('Chat Messages', false, 'Message not received');
      }
      resolve(messageReceived);
    }, 3000);
  });
}

// Test 5: Ride Status Changes
async function testRideStatusChanges() {
  return new Promise(async (resolve) => {
    console.log('\n=== Testing Ride Status Changes ===');

    const socket1 = io(GATEWAY_URL, { auth: { token }, transports: ['websocket'] });
    const socket2 = io(GATEWAY_URL, { auth: { token }, transports: ['websocket'] });

    let statusReceived = false;
    let socket1Joined = false;
    let socket2Joined = false;

    socket1.on('connect', async () => {
      socket1Joined = await joinRideWithCallback(socket1, 'status-test-123');
    });

    socket2.on('connect', async () => {
      socket2Joined = await joinRideWithCallback(socket2, 'status-test-123');

      // Wait for both sockets to join before sending status change
      const checkReady = () => {
        if (socket1Joined && socket2Joined) {
          setTimeout(() => {
            socket2.emit('ride_status_changed', {
              rideId: 'status-test-123',
              status: 'accepted'
            });
          }, 200);
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });

    socket1.on('ride_status_changed', (data) => {
      if (data.rideId === 'status-test-123' && data.status === 'accepted') {
        statusReceived = true;
        logTest('Ride Status Changes', true, 'Status change received by other client');
      }
    });

    setTimeout(() => {
      socket1.disconnect();
      socket2.disconnect();
      if (!statusReceived) {
        logTest('Ride Status Changes', false, 'Status change not received');
      }
      resolve(statusReceived);
    }, 3000);
  });
}

// Test 6: Invalid Token
async function testInvalidToken() {
  return new Promise((resolve) => {
    console.log('\n=== Testing Invalid Token Handling ===');

    const invalidToken = 'invalid.jwt.token';
    const socket = io(GATEWAY_URL, {
      auth: { token: invalidToken },
      transports: ['websocket'],
      timeout: 5000,
    });

    socket.on('connect', () => {
      logTest('Invalid Token Handling', false, 'Should not connect with invalid token');
      socket.disconnect();
      resolve(false);
    });

    socket.on('connect_error', (error) => {
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        logTest('Invalid Token Handling', true, 'Properly rejected invalid token');
      } else {
        logTest('Invalid Token Handling', false, `Unexpected error: ${error.message}`);
      }
      socket.disconnect();
      resolve(true);
    });

    setTimeout(() => {
      if (socket.connected) {
        logTest('Invalid Token Handling', false, 'Should not connect with invalid token');
        socket.disconnect();
        resolve(false);
      }
    }, 5000);
  });
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting WebSocket Thorough Testing Suite (Fixed)');
  console.log('==================================================');

  try {
    await testConnection();
    await testRoomManagement();
    await testEventBroadcasting();
    await testChatMessages();
    await testRideStatusChanges();
    await testInvalidToken();

    console.log('\n==================================================');
    console.log(`📊 Test Results: ${testsPassed} passed, ${testsFailed} failed`);

    if (testsFailed === 0) {
      console.log('🎉 All tests passed! WebSocket functionality is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please check the implementation.');
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
