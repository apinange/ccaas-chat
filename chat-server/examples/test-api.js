/**
 * Example script to test the Chat API
 * Run with: node examples/test-api.js
 */

import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:8000';

// Test health check
async function testHealthCheck() {
  console.log('\n=== Testing Health Check ===');
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test receive message (BOT)
async function testReceiveBotMessage() {
  console.log('\n=== Testing Receive BOT Message ===');
  try {
    const formData = new FormData();
    formData.append('flag', 'BOT');
    formData.append('timestamp', new Date().toISOString());
    formData.append('message_id', 'TEST_BOT_' + Date.now());
    formData.append('conversation_id', '17adfdec-e172-4394-a968-aab4119539b0');
    formData.append('user_id', '558184475278');
    formData.append('text', 'Hello! How can I help you today?');

    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test receive message (USER)
async function testReceiveUserMessage() {
  console.log('\n=== Testing Receive USER Message ===');
  try {
    const formData = new FormData();
    formData.append('flag', 'USER');
    formData.append('timestamp', new Date().toISOString());
    formData.append('message_id', 'TEST_USER_' + Date.now());
    formData.append('conversation_id', '17adfdec-e172-4394-a968-aab4119539b0');
    formData.append('user_id', '558184475278');
    formData.append('text', 'I would like to know about your promotions.');

    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test send message (AGENT)
async function testSendAgentMessage() {
  console.log('\n=== Testing Send AGENT Message ===');
  try {
    const formData = new FormData();
    formData.append('flag', 'AGENT');
    formData.append('timestamp', new Date().toISOString());
    formData.append('message_id', 'TEST_AGENT_' + Date.now());
    formData.append('conversation_id', '17adfdec-e172-4394-a968-aab4119539b0');
    formData.append('user_id', '558184475278');
    formData.append('text', 'Thank you for contacting us! We have great promotions available.');

    const response = await fetch(`${API_BASE_URL}/send`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('Starting API tests...\n');
  console.log('Make sure the server is running on http://localhost:8000\n');
  
  await testHealthCheck();
  await testReceiveBotMessage();
  await testReceiveUserMessage();
  await testSendAgentMessage();
  
  console.log('\n=== Tests completed ===');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testHealthCheck, testReceiveBotMessage, testReceiveUserMessage, testSendAgentMessage };

