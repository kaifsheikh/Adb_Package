 // Variables
        let cachedApps = [];
        let currentDevice = null;

        // Initialize
        document.addEventListener("DOMContentLoaded", function() {
            updateStats();
            setupTabNavigation();
            
            // Add event listeners for search boxes
            document.getElementById('forceSearch').addEventListener('input', function() {
                filterApps('forceApps', 'forceSearch');
            });
            
            document.getElementById('clearSearch').addEventListener('input', function() {
                filterApps('clearApps', 'clearSearch');
            });
            
            document.getElementById('launchSearch').addEventListener('input', function() {
                filterApps('launchApps', 'launchSearch');
            });
            
            document.getElementById('uninstallSearch').addEventListener('input', function() {
                filterApps('uninstallApps', 'uninstallSearch');
            });
            
            // Update stats when apps list changes
            document.getElementById('forceApps').addEventListener('change', updateStats);
            document.getElementById('clearApps').addEventListener('change', updateStats);
            document.getElementById('uninstallApps').addEventListener('change', updateStats);
        });

        // Tab Navigation
        function setupTabNavigation() {
            const tabBtns = document.querySelectorAll('.tab-btn');
            tabBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const tabId = this.getAttribute('data-tab');
                    
                    // Update active tab button
                    tabBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Show corresponding tab content
                    document.querySelectorAll('.tab-content').forEach(content => {
                        content.classList.remove('active');
                    });
                    document.getElementById(`${tabId}-tab`).classList.add('active');
                });
            });
        }

        // Update Statistics
        function updateStats() {
            const deviceSelect = document.getElementById('device');
            const devicesCount = deviceSelect.options.length - 1; // Exclude first option
            const appsCount = cachedApps.length;
            
            // Calculate selected apps
            let selectedCount = 0;
            ['forceApps', 'clearApps', 'uninstallApps'].forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    selectedCount += select.selectedOptions.length;
                }
            });
            
            document.getElementById('devices-count').textContent = Math.max(0, devicesCount);
            document.getElementById('apps-count').textContent = appsCount;
            document.getElementById('selected-count').textContent = selectedCount;
        }

        // Loading Indicator
        function showLoading(show) {
            document.getElementById('loading').classList.toggle('active', show);
        }

        // Scan Devices
        function scan() {
            showLoading(true);
            document.getElementById('status').innerText = "🔍 Scanning for wireless ADB devices...";
            
            fetch("/scan")
            .then(res => res.json())
            .then(devices => {
                let select = document.getElementById("device");
                select.innerHTML = '<option value="" disabled selected>Select a device...</option>';
                
                devices.forEach(device => {
                    let option = document.createElement("option");
                    option.value = device.ip;
                    option.text = `${device.name} | ${device.status}`;
                    option.dataset.device = JSON.stringify(device);
                    select.appendChild(option);
                });
                
                // Update device selection event
                select.onchange = function() {
                    const selectedOption = this.options[this.selectedIndex];
                    if (selectedOption.dataset.device) {
                        const device = JSON.parse(selectedOption.dataset.device);
                        currentDevice = device;
                        updateDeviceInfo(device);
                        document.getElementById('status').innerText = `📱 Selected: ${device.name} (${device.ip})`;
                    }
                };
                
                document.getElementById('status').innerText = `✅ Found ${devices.length} device(s). Select a device to proceed.`;
                showLoading(false);
                updateStats();
                
                // Auto-select first device if available
                if (devices.length > 0) {
                    select.selectedIndex = 1;
                    select.dispatchEvent(new Event('change'));
                }
            })
            .catch(error => {
                document.getElementById('status').innerText = `❌ Error scanning devices: ${error}`;
                showLoading(false);
            });
        }

        // Update Device Information
        function updateDeviceInfo(device) {
            const details = document.getElementById('device-details');
            const statusColor = device.status === 'Connected' ? '#4ade80' : '#f87171';
            
            details.innerHTML = `
                <div style="margin-bottom: 8px;"><strong>Name:</strong> ${device.name}</div>
                <div style="margin-bottom: 8px;"><strong>IP:</strong> ${device.ip}</div>
                <div style="margin-bottom: 8px;"><strong>Status:</strong> <span style="color: ${statusColor}">${device.status}</span></div>
            `;
        }

        // Load Apps
        function loadApps() {
            const deviceSelect = document.getElementById('device');
            if (!deviceSelect.value) {
                document.getElementById('status').innerText = "⚠️ Please select a device first.";
                return;
            }
            
            showLoading(true);
            document.getElementById('status').innerText = `📦 Loading apps from device...`;
            
            fetch("/apps", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({device: deviceSelect.value})
            })
            .then(res => res.json())
            .then(apps => {
                cachedApps = apps;
                
                // Populate all app lists
                ["forceApps", "clearApps", "uninstallApps", "launchApps"].forEach(id => {
                    populateSelect(id, apps);
                });
                
                document.getElementById('status').innerText = `✅ Loaded ${apps.length} apps from device.`;
                showLoading(false);
                updateStats();
            })
            .catch(error => {
                document.getElementById('status').innerText = `❌ Error loading apps: ${error}`;
                showLoading(false);
            });
        }

        // Populate Select Element
        function populateSelect(id, apps) {
            let select = document.getElementById(id);
            select.innerHTML = "";
            
            apps.forEach(app => {
                let option = document.createElement("option");
                option.value = app;
                option.text = app;
                select.appendChild(option);
            });
        }

        // Filter Apps
        function filterApps(selectId, inputId) {
            let filter = document.getElementById(inputId).value.toLowerCase();
            let select = document.getElementById(selectId);
            
            for (let i = 0; i < select.options.length; i++) {
                let option = select.options[i];
                option.style.display = option.text.toLowerCase().includes(filter) ? "" : "none";
            }
        }

        // Get Selected Apps
        function selected(id) {
            return [...document.getElementById(id).selectedOptions].map(o => o.value);
        }

        // Select All Apps
        function selectAllApps() {
            ['forceApps', 'clearApps', 'uninstallApps'].forEach(id => {
                const select = document.getElementById(id);
                for (let i = 0; i < select.options.length; i++) {
                    select.options[i].selected = true;
                }
            });
            updateStats();
            document.getElementById('status').innerText = "✅ All apps selected.";
        }

        // Deselect All Apps
        function deselectAllApps() {
            ['forceApps', 'clearApps', 'uninstallApps'].forEach(id => {
                const select = document.getElementById(id);
                for (let i = 0; i < select.options.length; i++) {
                    select.options[i].selected = false;
                }
            });
            updateStats();
            document.getElementById('status').innerText = "✅ All apps deselected.";
        }

        // Force Stop Apps
        function forceStop(all) {
            const deviceSelect = document.getElementById('device');
            if (!deviceSelect.value) {
                document.getElementById('status').innerText = "⚠️ Please select a device first.";
                return;
            }
            
            let apps = all ? cachedApps : selected("forceApps");
            if (!apps.length) { 
                alert("⚠️ Please select at least one app!"); 
                return; 
            }
            
            if (!all && !confirm(`Force stop ${apps.length} selected app(s)?`)) {
                return;
            }
            
            if (all && !confirm(`⚠️ WARNING: Force stop ALL ${apps.length} apps? This may cause system instability!`)) {
                return;
            }
            
            send("/force_stop", {device: deviceSelect.value, apps});
        }

        // Clear Apps Data
        function clearApps(all) {
            const deviceSelect = document.getElementById('device');
            if (!deviceSelect.value) {
                document.getElementById('status').innerText = "⚠️ Please select a device first.";
                return;
            }
            
            let apps = all ? cachedApps : selected("clearApps");
            if (!apps.length) { 
                alert("⚠️ Please select at least one app!"); 
                return; 
            }
            
            let warning = all ? 
                `⚠️ WARNING: Clear data for ALL ${apps.length} apps?\n\nThis will delete ALL app data (logins, settings, cache)!` :
                `Clear data for ${apps.length} selected app(s)?\n\nThis will delete app data (logins, settings, cache)!`;
            
            if (!confirm(warning)) {
                return;
            }
            
            send("/clear", {device: deviceSelect.value, apps});
        }

        // Launch App
        function launchApp() {
            const deviceSelect = document.getElementById('device');
            const launchSelect = document.getElementById('launchApps');
            
            if (!deviceSelect.value) {
                document.getElementById('status').innerText = "⚠️ Please select a device first.";
                return;
            }
            
            if (!launchSelect.value) { 
                alert("⚠️ Please select an app to launch!"); 
                return; 
            }
            
            send("/launch", {device: deviceSelect.value, app: launchSelect.value});
        }

        // Uninstall Apps
        function uninstall() {
            const deviceSelect = document.getElementById('device');
            if (!deviceSelect.value) {
                document.getElementById('status').innerText = "⚠️ Please select a device first.";
                return;
            }
            
            let apps = selected("uninstallApps");
            if (!apps.length) { 
                alert("⚠️ Please select at least one app!"); 
                return; 
            }
            
            if (!confirm(`⚠️ WARNING: Uninstall ${apps.length} selected app(s)?\n\nThis action cannot be undone!`)) {
                return;
            }
            
            send("/uninstall", {device: deviceSelect.value, apps});
        }

        // Battery Status
        function battery() {
            const deviceSelect = document.getElementById('device');
            if (!deviceSelect.value) {
                document.getElementById('status').innerText = "⚠️ Please select a device first.";
                return;
            }
            
            showLoading(true);
            document.getElementById('status').innerText = "🔋 Getting battery information...";
            
            fetch("/battery", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({device: deviceSelect.value})
            })
            .then(res => res.json())
            .then(data => {
                document.getElementById('batteryOut').innerText = data;
                document.getElementById('status').innerText = "✅ Battery information retrieved.";
                showLoading(false);
                
                // Switch to battery tab
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelector('.tab-btn[data-tab="battery"]').classList.add('active');
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById('battery-tab').classList.add('active');
            })
            .catch(error => {
                document.getElementById('status').innerText = `❌ Error getting battery info: ${error}`;
                showLoading(false);
            });
        }

        // Send Request
        function send(url, data) {
            showLoading(true);
            
            fetch(url, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(response => {
                if (Array.isArray(response)) {
                    document.getElementById('status').innerText = response.join('\n');
                } else {
                    document.getElementById('status').innerText = response;
                }
                showLoading(false);
                updateStats();
            })
            .catch(error => {
                document.getElementById('status').innerText = `❌ Error: ${error}`;
                showLoading(false);
            });
        }

        // Clear Status
        function clearStatus() {
            document.getElementById('status').innerText = "Status log cleared.";
        }